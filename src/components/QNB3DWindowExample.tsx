import React from 'react';

// QNB 3D ödeme HTML yanıtını yeni pencerede açan örnek
export function QNB3DWindowExample({ paymentData }: { paymentData: any }) {
  const handlePayment = async () => {
    const res = await fetch('/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    const html = await res.text();
    const win = window.open('', '_blank');
    win?.document.write(html);
    win?.document.close();
  };

  return (
    <button onClick={handlePayment} className="btn btn-primary">
      QNB 3D Ödeme
    </button>
  );
}
