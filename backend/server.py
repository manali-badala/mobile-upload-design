from io import BytesIO

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return 'Welcome to the PDF signing server! Use /sign to upload and sign a PDF.'

@app.route('/sign', methods=['POST'])
def sign_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    initials = "DELTA CAPITA"
    display_name = request.form.get('displayName', '').strip()

    if file and file.filename.endswith('.pdf'):
        pdf_reader = PdfReader(file)
        pdf_writer = PdfWriter()

        if display_name:
            pdf_writer.add_metadata({"/Title": display_name})

        signature_text = f"Signed By: {initials}"

        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            page_width = float(page.mediabox.width)
            page_height = float(page.mediabox.height)

            packet = BytesIO()
            can = canvas.Canvas(packet, pagesize=(page_width, page_height))
            can.setFont("Helvetica", 12)
            text_width = can.stringWidth(signature_text, "Helvetica", 12)
            x_position = max(30, (page_width - text_width) / 2)
            y_position = 15
            can.drawString(x_position, y_position, signature_text)
            can.save()

            packet.seek(0)
            signature_overlay = PdfReader(packet).pages[0]

            page.merge_page(signature_overlay)  
            pdf_writer.add_page(page)

        output_pdf = BytesIO()
        pdf_writer.write(output_pdf)
        output_pdf.seek(0)

        return send_file(output_pdf, as_attachment=True, download_name="signed.pdf", mimetype='application/pdf')

    else:
        return jsonify({"error": "Please upload a valid PDF file."}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4000)
