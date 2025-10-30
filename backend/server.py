from io import BytesIO

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Add this route to handle the root URL (http://127.0.0.1:4000/)
@app.route('/')
def home():
    return 'Welcome to the PDF signing server! Use /sign to upload and sign a PDF.'

# Endpoint to simulate signing the PDF
@app.route('/sign', methods=['POST'])
def sign_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    raw_initials = request.form.get('signerName', '').strip() or "AA"
    initials = "".join(char.upper() for char in raw_initials if char.isalpha())[:3] or "AA"
    display_name = request.form.get('displayName', '').strip()

    if file and file.filename.endswith('.pdf'):
        # Read the incoming PDF
        pdf_reader = PdfReader(file)
        pdf_writer = PdfWriter()

        if display_name:
            pdf_writer.add_metadata({"/Title": display_name})

        signature_text = f"Signed By: {initials}"

        # Overlay the signature onto each page
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            page_width = float(page.mediabox.width)
            page_height = float(page.mediabox.height)

            # Create a temporary buffer to add the signature text for the current page
            packet = BytesIO()
            can = canvas.Canvas(packet, pagesize=(page_width, page_height))
            can.setFont("Helvetica", 12)
            text_width = can.stringWidth(signature_text, "Helvetica", 12)
            x_position = max(30, (page_width - text_width) / 2)
            y_position = 30  # Place near bottom margin
            can.drawString(x_position, y_position, signature_text)
            can.save()

            packet.seek(0)
            signature_overlay = PdfReader(packet).pages[0]

            page.merge_page(signature_overlay)  # Merge the signature with the original page
            pdf_writer.add_page(page)

        # Save the signed PDF to a BytesIO buffer
        output_pdf = BytesIO()
        pdf_writer.write(output_pdf)
        output_pdf.seek(0)

        # Send the signed PDF back as response
        return send_file(output_pdf, as_attachment=True, download_name="signed.pdf", mimetype='application/pdf')

    else:
        return jsonify({"error": "Please upload a valid PDF file."}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4000)
