import html
import logging
import smtplib
import ssl
from email.headerregistry import Address
from email.message import EmailMessage
from urllib.parse import quote

from app.config import settings


logger = logging.getLogger(__name__)


class EmailService:
    """Fail-open transactional email delivery through Gmail SMTP."""

    @staticmethod
    def _frontend_url() -> str:
        return settings.FRONTEND_URL.split(",", 1)[0].strip().rstrip("/")

    @staticmethod
    def _layout(*, eyebrow: str, heading: str, body: str, status: str, cta_label: str, cta_url: str) -> str:
        return f"""<!doctype html>
<html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
<div style="padding:32px 16px"><div style="max-width:600px;margin:auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden">
<div style="background:#020617;padding:24px 28px;color:#fff"><div style="font-size:22px;font-weight:800">Reflex</div><div style="margin-top:4px;color:#94a3b8;font-size:12px">Delivery Management</div></div>
<div style="padding:30px 28px"><div style="color:#2563eb;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em">{html.escape(eyebrow)}</div>
<h1 style="font-size:26px;line-height:1.25;margin:10px 0 14px">{html.escape(heading)}</h1>
<div style="display:inline-block;background:#eff6ff;color:#1d4ed8;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700">{html.escape(status)}</div>
<div style="font-size:15px;line-height:1.7;color:#475569;margin-top:20px">{body}</div>
<a href="{html.escape(cta_url, quote=True)}" style="display:inline-block;margin-top:24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:10px;padding:13px 20px;font-size:14px;font-weight:700">{html.escape(cta_label)}</a>
</div><div style="border-top:1px solid #e2e8f0;padding:18px 28px;color:#94a3b8;font-size:12px">This is an automated message from Reflex.</div>
</div></div></body></html>"""

    async def send(self, *, to: str, subject: str, html_body: str, text_body: str, idempotency_key: str) -> bool:
        if not settings.EMAIL_ENABLED:
            logger.info("Transactional email skipped because EMAIL_ENABLED is false: %s", idempotency_key)
            return False
        if not settings.SMTP_USERNAME or not settings.SMTP_APP_PASSWORD:
            logger.warning("Transactional email skipped because Gmail SMTP is not configured: %s", idempotency_key)
            return False
        try:
            message = EmailMessage()
            message["From"] = Address(
                display_name=settings.EMAIL_FROM_NAME,
                addr_spec=settings.SMTP_USERNAME,
            )
            message["To"] = to
            message["Subject"] = subject
            message["X-Reflex-Idempotency-Key"] = idempotency_key
            message.set_content(text_body)
            message.add_alternative(html_body, subtype="html")

            self._send_smtp(message)
            logger.info("Transactional email sent: %s", idempotency_key)
            return True
        except Exception:
            logger.exception("Transactional email failed without affecting the Reflex operation: %s", idempotency_key)
            return False

    @staticmethod
    def _send_smtp(message: EmailMessage) -> None:
        tls_context = ssl.create_default_context()
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as smtp:
            smtp.ehlo()
            smtp.starttls(context=tls_context)
            smtp.ehlo()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_APP_PASSWORD)
            smtp.send_message(message)

    async def account_created(self, user: dict) -> bool:
        role = str(user["role"]).replace("_", " ").title()
        login_url = f"{self._frontend_url()}/login"
        name = html.escape(user["name"])
        body = f"<p>Hello {name},</p><p>Your Reflex account has been created successfully.</p><p><strong>Requested role:</strong> {html.escape(role)}.</p><p>Your account is awaiting Reflex Admin approval. We will email you again when access is active.</p>"
        text = f"Hello {user['name']},\n\nYour Reflex account has been created successfully. Requested role: {role}. Your account is awaiting Reflex Admin approval. We will email you again when access is active.\n\n{login_url}"
        return await self.send(to=user["email"], subject="Welcome to Reflex — Account Awaiting Approval", html_body=self._layout(eyebrow="Account created", heading=f"Welcome to Reflex, {user['name']}", body=body, status="Awaiting Admin approval", cta_label="Open Reflex", cta_url=login_url), text_body=text, idempotency_key=f"account-created:{user['id']}")

    async def account_approved(self, user: dict) -> bool:
        role = str(user["role"]).replace("_", " ").title()
        login_url = f"{self._frontend_url()}/login"
        body = f"<p>Hello {html.escape(user['name'])},</p><p>Your <strong>{html.escape(role)}</strong> account has been approved. Your Reflex access is now active.</p>"
        text = f"Hello {user['name']},\n\nYour {role} account has been approved. You can now sign in to Reflex.\n\n{login_url}"
        return await self.send(to=user["email"], subject="Your Reflex Account Has Been Approved", html_body=self._layout(eyebrow="Access approved", heading="Your Reflex account is active", body=body, status=f"Active {role}", cta_label="Sign in to Reflex", cta_url=login_url), text_body=text, idempotency_key=f"account-approved:{user['id']}")

    async def rider_assigned(self, delivery: dict, retailer: dict, rider: dict | None) -> None:
        delivery_id = delivery["id"]
        detail_url = f"{self._frontend_url()}/retailer/deliveries/{quote(delivery_id)}"
        rider_name = delivery.get("rider") or "A Reflex rider"
        destination = delivery.get("destination") or "the delivery destination"
        retailer_body = f"<p>Hello {html.escape(retailer['name'])},</p><p><strong>{html.escape(rider_name)}</strong> has been assigned to delivery <strong>{html.escape(delivery_id)}</strong>.</p><p>Destination: {html.escape(destination)}.</p>"
        await self.send(to=retailer["email"], subject=f"Rider Assigned — {delivery_id}", html_body=self._layout(eyebrow="Delivery update", heading="A rider has been assigned", body=retailer_body, status="Assigned", cta_label="View delivery", cta_url=detail_url), text_body=f"{rider_name} has been assigned to {delivery_id}. Destination: {destination}.\n\n{detail_url}", idempotency_key=f"rider-assigned:{delivery_id}:retailer")
        if rider and rider.get("email"):
            rider_url = f"{self._frontend_url()}/rider/deliveries/{quote(delivery_id)}"
            rider_body = f"<p>Hello {html.escape(rider['name'])},</p><p>You have a new Reflex assignment: <strong>{html.escape(delivery_id)}</strong>.</p><p>Route: {html.escape(delivery.get('pickup') or 'Pickup')} → {html.escape(destination)}. Open Reflex for the complete assignment.</p>"
            await self.send(to=rider["email"], subject=f"New Reflex Delivery Assignment — {delivery_id}", html_body=self._layout(eyebrow="New assignment", heading="A delivery is ready for you", body=rider_body, status="Assigned", cta_label="Open assignment", cta_url=rider_url), text_body=f"You have a new Reflex assignment: {delivery_id}. Open Reflex for the complete pickup and delivery information.\n\n{rider_url}", idempotency_key=f"rider-assigned:{delivery_id}:rider")

    async def delivery_delivered(self, delivery: dict, retailer: dict) -> bool:
        delivery_id = delivery["id"]
        detail_url = f"{self._frontend_url()}/retailer/deliveries/{quote(delivery_id)}"
        body = f"<p>Hello {html.escape(retailer['name'])},</p><p>Delivery <strong>{html.escape(delivery_id)}</strong> has been marked Delivered.</p><p>The recipient must still confirm receipt before the delivery becomes Completed.</p>"
        return await self.send(to=retailer["email"], subject="Delivery Arrived — Awaiting Customer Confirmation", html_body=self._layout(eyebrow="Delivery update", heading=f"{delivery_id} has arrived", body=body, status="Delivered · Awaiting confirmation", cta_label="View delivery", cta_url=detail_url), text_body=f"{delivery_id} has been marked Delivered and is awaiting confirmation from the recipient. It is not Completed yet.\n\n{detail_url}", idempotency_key=f"delivery-delivered:{delivery_id}")

    async def delivery_completed(self, delivery: dict, retailer: dict) -> bool:
        delivery_id = delivery["id"]
        detail_url = f"{self._frontend_url()}/retailer/deliveries/{quote(delivery_id)}"
        completed_at = delivery.get("updated_at") or "the recorded completion time"
        body = f"<p>Hello {html.escape(retailer['name'])},</p><p>Delivery <strong>{html.escape(delivery_id)}</strong> has been successfully completed.</p><p>The recipient confirmed receipt through the secure Reflex confirmation process.</p><p><strong>Completed:</strong> {html.escape(completed_at)}</p>"
        return await self.send(to=retailer["email"], subject=f"Delivery Completed Successfully — {delivery_id}", html_body=self._layout(eyebrow="Delivery completed", heading="Receipt confirmed successfully", body=body, status="Completed", cta_label="View delivery history", cta_url=detail_url), text_body=f"Delivery {delivery_id} has been successfully completed. The recipient confirmed receipt through the secure Reflex confirmation process. Completed: {completed_at}.\n\n{detail_url}", idempotency_key=f"delivery-completed:{delivery_id}")


email_service = EmailService()
