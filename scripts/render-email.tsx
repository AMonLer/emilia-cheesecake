import { render } from '@react-email/render';
import OrderConfirmationEmail from '../emails/OrderConfirmation';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';

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

fs.writeFileSync(path.join(process.cwd(), 'emails', 'preview.html'), html);
console.log('Email rendered to emails/preview.html');
