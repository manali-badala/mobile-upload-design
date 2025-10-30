from io import BytesIO

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas

app = Flask(__name__)
CORS(app)


@app.route("/")
def root() -> str:
    return "PDF signing API up and running"


@app.route("/sign", methods=["POST"])
def sign_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    raw_initials = request.form.get("signerName", "").strip() or "AA"
    display_name = request.form.get("displayName", "").strip()
    initials = "".join(char.upper() for char in raw_initials if char.isalpha())[:3] or "AA"

    if not (file and file.filename.endswith(".pdf")):
        return jsonify({"error": "Please upload a valid PDF file."}), 400

    pdf_reader = PdfReader(file)
    pdf_writer = PdfWriter()

    if display_name:
        pdf_writer.add_metadata({"/Title": display_name})

    for page in pdf_reader.pages:
        page_width = float(page.mediabox.width)
        page_height = float(page.mediabox.height)

        buffer = BytesIO()
        can = canvas.Canvas(buffer, pagesize=(page_width, page_height))
        can.setFont("Helvetica", 12)
        text_width = can.stringWidth(f"Initials: {initials}", "Helvetica", 12)
        x_position = max(30, (page_width - text_width) / 2)
        y_position = 30
        can.drawString(x_position, y_position, f"Initials: {initials}")
        can.save()

        buffer.seek(0)
        overlay_page = PdfReader(buffer).pages[0]
        page.merge_page(overlay_page)
        pdf_writer.add_page(page)

    output_pdf = BytesIO()
    pdf_writer.write(output_pdf)
    output_pdf.seek(0)

    return send_file(
        output_pdf,
        as_attachment=True,
        download_name="signed.pdf",
        mimetype="application/pdf",
    )


app.add_url_rule("/api/sign", view_func=sign_pdf, methods=["POST"])
