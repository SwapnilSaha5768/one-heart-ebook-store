# backend/orders/emails.py

from django.core.mail import send_mail
from django.conf import settings

def send_payment_confirmed_email(order):
    """
    Send an email to the user when payment is confirmed.
    Includes book titles and their pdf passwords (if set).
    """
    user = order.user
    email = user.email

    # Build a list of lines with book credentials
    lines = []
    for item in order.items.select_related("book"):
        book = item.book
        # only mention password for PDFs (optional)
        if book.pdf_password:
            lines.append(
                f"Book Title: {book.title}\n"
                f"PDF password: {book.pdf_password}\n"
            )
        else:
            lines.append(
                f"Book Title: {book.title}\n"
                f"PDF password: (no password set)\n"
            )

    books_block = "\n".join(lines) if lines else "No books found for this order."

    subject = "Payment Confirmed – Your OneHeart eBook Credentials"

    message = (
        f"Assalamu Alaikum {user.first_name or user.username},\n\n"
        f"Your payment for order #{order.order_number} has been confirmed.\n\n"
        f"Here are your book credentials:\n\n"
        f"{books_block}\n"
        f"You can now download your books from your library.\n\n"
        f"Thank you for purchasing from OneHeart eBook!\n"
        f"- OneHeart eBook Team"
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
