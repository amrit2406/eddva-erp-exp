import { useState } from 'react';
import { Receipt } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import GenericDataView from '../common/GenericDataView';
import { getPaymentReceipt } from '../../api/hostel.api';
import { useToast } from '../../../../hooks/useToast';
import { extensionForMime, saveBlob } from '../../utils/download';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { isPlainObject } from '../../utils/format';
import type { GenericRecord } from '../../types/hostel.types';

// Documents a browser can show itself; anything else is downloaded.
const VIEWABLE = ['application/pdf', 'text/html', 'image/'];

// The receipt's format isn't known up front: JSON data is shown in a dialog, a
// PDF/HTML/image opens in a new tab, and any other file is downloaded.
export default function ReceiptButton({ paymentId }: { paymentId: string | number }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<GenericRecord | GenericRecord[] | null>(null);

  const handleClick = async () => {
    try {
      setBusy(true);
      const { blob, filename } = await getPaymentReceipt(paymentId);
      const type = blob.type.toLowerCase();

      if (type.includes('json')) {
        const parsed: unknown = JSON.parse(await blob.text());
        const payload = isPlainObject(parsed) && parsed.data !== undefined ? parsed.data : parsed;
        setReceipt(Array.isArray(payload) || isPlainObject(payload) ? (payload as GenericRecord | GenericRecord[]) : {});
        return;
      }

      const name = filename ?? `receipt-${paymentId}${extensionForMime(type) ? `.${extensionForMime(type)}` : ''}`;
      if (VIEWABLE.some((prefix) => type.startsWith(prefix))) {
        const url = URL.createObjectURL(blob);
        const tab = window.open(url, '_blank');
        // A blocked pop-up would show nothing, so fall back to saving the file.
        if (!tab) saveBlob(blob, name);
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        saveBlob(blob, name);
      }
    } catch (err) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to load the receipt'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="secondary" disabled={busy} onClick={handleClick}>
        <Receipt className="h-4 w-4 mr-2" />
        {busy ? 'Loading...' : 'Receipt'}
      </Button>
      {receipt && (
        <Modal isOpen onClose={() => setReceipt(null)} title="Payment Receipt" size="xl">
          <GenericDataView data={receipt} emptyMessage="The receipt is empty" />
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => setReceipt(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
