import OrderConfirmationEmail from '../../emails/OrderConfirmation';
import { render } from '@react-email/render';

export default async function PreviewEmailPage() {
    const html = await render(<OrderConfirmationEmail
        customerName="Adrian"
        orderId="12345"
        amount={45.00}
        items={[
            { name: 'Classic Cheesecake', quantity: 1, price: 45.00, size: '6-8' }
        ]}
        address="Musterstrasse 1"
        city="Zurich"
        postalCode="8000"
        deliveryDate="01.01.2025"
        deliveryTime="14:00 - 16:00"
    />, {
        pretty: true,
    });

    return (
        <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
            <h1 style={{ marginBottom: 20 }}>Email Preview</h1>
            <p>Below is the rendered email and the HTML source code.</p>

            <div style={{ border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden', marginBottom: 40 }}>
                <div style={{ background: '#eee', padding: '10px 20px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>Preview</div>
                <iframe
                    srcDoc={html}
                    style={{ width: '100%', height: '800px', border: 'none', display: 'block' }}
                />
            </div>

            <div style={{ marginBottom: 40 }}>
                <h2 style={{ marginBottom: 10 }}>HTML Source Code</h2>
                <textarea
                    readOnly
                    style={{
                        width: '100%',
                        height: '400px',
                        fontFamily: 'monospace',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #ccc',
                        resize: 'vertical'
                    }}
                    defaultValue={html}
                />
            </div>
        </div>
    );
}
