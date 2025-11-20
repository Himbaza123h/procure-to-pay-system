import os
from datetime import datetime
from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
import io

def generate_purchase_order(purchase_request):
    """
    Generate a Purchase Order PDF for an approved purchase request
    Returns: ContentFile object to save to FileField
    """
    buffer = io.BytesIO()
    
    # Create the PDF document
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("<b>PURCHASE ORDER</b>", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 0.2 * inch))
    
    # PO Number and Date
    po_number = f"PO-{purchase_request.id:06d}"
    po_date = datetime.now().strftime("%Y-%m-%d")
    
    info_data = [
        ['PO Number:', po_number],
        ['Date:', po_date],
        ['Status:', 'APPROVED'],
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 3*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.3 * inch))
    
    # Vendor Information
    vendor_title = Paragraph("<b>Vendor Information</b>", styles['Heading2'])
    story.append(vendor_title)
    story.append(Spacer(1, 0.1 * inch))
    
    vendor_name = purchase_request.vendor_name or 'Vendor Name Not Extracted'
    vendor_para = Paragraph(f"<b>Vendor:</b> {vendor_name}", styles['Normal'])
    story.append(vendor_para)
    story.append(Spacer(1, 0.3 * inch))
    
    # Request Details
    details_title = Paragraph("<b>Request Details</b>", styles['Heading2'])
    story.append(details_title)
    story.append(Spacer(1, 0.1 * inch))
    
    details_para = Paragraph(f"<b>Title:</b> {purchase_request.title}", styles['Normal'])
    story.append(details_para)
    story.append(Spacer(1, 0.1 * inch))
    
    desc_para = Paragraph(f"<b>Description:</b> {purchase_request.description}", styles['Normal'])
    story.append(desc_para)
    story.append(Spacer(1, 0.3 * inch))
    
    # Items Table
    if purchase_request.extracted_items:
        items_title = Paragraph("<b>Items</b>", styles['Heading2'])
        story.append(items_title)
        story.append(Spacer(1, 0.1 * inch))
        
        # Table headers
        items_data = [['Item', 'Quantity', 'Unit Price', 'Total']]
        
        total_amount = 0
        for item in purchase_request.extracted_items:
            name = item.get('name', 'N/A')
            qty = item.get('quantity', 1)
            price = float(item.get('price', 0))
            item_total = qty * price
            total_amount += item_total
            
            items_data.append([
                name,
                str(qty),
                f"${price:.2f}",
                f"${item_total:.2f}"
            ])
        
        # Add total row
        items_data.append(['', '', 'TOTAL:', f"${total_amount:.2f}"])
        
        items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
            ('GRID', (0, 0), (-1, -2), 1, colors.black),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ]))
        story.append(items_table)
    else:
        # Show total amount only
        amount_para = Paragraph(f"<b>Total Amount:</b> ${purchase_request.amount:.2f}", styles['Normal'])
        story.append(amount_para)
    
    story.append(Spacer(1, 0.5 * inch))
    
    # Approval Information
    approval_title = Paragraph("<b>Approvals</b>", styles['Heading2'])
    story.append(approval_title)
    story.append(Spacer(1, 0.1 * inch))
    
    approvals = purchase_request.approvals.filter(action='approved').order_by('level')
    for approval in approvals:
        approval_text = f"Level {approval.level}: {approval.approver.get_full_name() or approval.approver.username} - {approval.created_at.strftime('%Y-%m-%d %H:%M')}"
        approval_para = Paragraph(approval_text, styles['Normal'])
        story.append(approval_para)
        story.append(Spacer(1, 0.05 * inch))
    
    story.append(Spacer(1, 0.3 * inch))
    
    # Footer
    footer = Paragraph("<i>This is an automatically generated Purchase Order</i>", styles['Normal'])
    story.append(footer)
    
    # Build PDF
    doc.build(story)
    
    # Get PDF content
    buffer.seek(0)
    pdf_content = buffer.getvalue()
    buffer.close()
    
    # Create ContentFile to save to model
    filename = f"PO-{purchase_request.id:06d}.pdf"
    return ContentFile(pdf_content, name=filename)