import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonToast,
  IonItemOptions,
  IonIcon,
  IonItemSliding,
  IonItemOption,
  IonModal,
  useIonViewWillEnter
} from '@ionic/react';
import { useState, useRef } from 'react';
import { trash, pencil, close } from 'ionicons/icons';
import './Tab3.css';

type Income = { id?: number; date: string; amount: number; text: string };

const TOKEN = localStorage.getItem('token') || '';

const Tab3: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editText, setEditText] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const slidingRefs = useRef<{ [key: number]: HTMLIonItemSlidingElement | null }>({});

  const fetchIncomes = async () => {
    try {
      const response = await fetch(`http://localhost:8009/q/income_history/?token=${TOKEN}`);
      const result = await response.json();
      setIncomes(result.incomes);
    } catch (err) {
      console.error('Error fetching incomes:', err);
    }
  };

  useIonViewWillEnter(() => {
    fetchIncomes();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);
    try {
      const response = await fetch('http://localhost:8009/submit/income/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: TOKEN, amount, text, date }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setShowSuccessToast(true);
      setAmount('');
      setText('');
      setDate('');
      await fetchIncomes();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
      setShowErrorToast(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = async (income: Income) => {
    if (income.id !== undefined && slidingRefs.current[income.id]) {
      await slidingRefs.current[income.id]?.close();
    }
    setEditingId(income.id || null);
    setEditAmount(String(income.amount));
    setEditText(income.text);
    setEditDate(income.date);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const response = await fetch('http://localhost:8009/update_income/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: TOKEN,
          income_id: String(editingId),
          amount: editAmount,
          text: editText,
          date: editDate
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setShowEditModal(false);
      setEditingId(null);
      setShowSuccessToast(true);
      await fetchIncomes();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
      setShowErrorToast(true);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (slidingRefs.current[id]) {
      await slidingRefs.current[id]?.close();
    }
    try {
      const response = await fetch('http://localhost:8009/delete/income/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: TOKEN, income_id: String(id) }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setShowSuccessToast(true);
      await fetchIncomes();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
      setShowErrorToast(true);
    }
  };

  return (
    <IonPage>
      <style>{`
        ion-item-sliding ion-item-options {
          border: none;
        }
        ion-item-option {
          padding: 0;
          margin: 0;
        }
      `}</style>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Income</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <form onSubmit={handleSubmit} style={{ marginTop: 16, marginBottom: 30 }}>
          <IonItem>
            <IonInput
              type="number"
              placeholder="Amount"
              value={amount}
              onIonChange={e => setAmount(e.detail.value || '')}
              required
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="text"
              value={text}
              placeholder="Description"
              onIonChange={e => setText(e.detail.value || '')}
              required
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="date"
              value={date}
              onIonChange={e => setDate(e.detail.value || '')}
              placeholder="Date"
              required
            />
          </IonItem>
          <IonButton type="submit" expand="block" disabled={submitLoading} style={{ marginTop: 12 }}>
            Submit Income
          </IonButton>
        </form>

        <IonLabel style={{ fontWeight: 'bold', display: 'block', marginTop: 20 }}>Income History</IonLabel>
        {incomes.map((income) => (
          <IonItemSliding 
            key={income.id}
            ref={(el) => {
              if (income.id !== undefined) {
                slidingRefs.current[income.id] = el;
              }
            }}
          >
            <IonItem lines="full">
              <IonLabel>
                <h2>{income.date}</h2>
                <p>${income.amount.toFixed(2)}</p>
                <p>{income.text}</p>
              </IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption 
                color="primary" 
                onClick={() => handleEditClick(income)}
              >
                <IonIcon slot="icon-only" icon={pencil} />
              </IonItemOption>
              <IonItemOption 
                color="danger" 
                onClick={() => handleDelete(income.id)}
              >
                <IonIcon slot="icon-only" icon={trash} />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}

        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Income</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowEditModal(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{ padding: '20px' }}>
              <IonItem>
                <IonInput
                  type="date"
                  value={editDate}
                  placeholder="Date"
                  onIonChange={e => setEditDate(e.detail.value || '')}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  type="number"
                  value={editAmount}
                  placeholder="Amount"
                  onIonChange={e => setEditAmount(e.detail.value || '')}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  type="text"
                  value={editText}
                  placeholder="Description"
                  onIonChange={e => setEditText(e.detail.value || '')}
                />
              </IonItem>
              <IonButton expand="block" color="success" onClick={handleSaveEdit} style={{ marginTop: 20 }}>
                Save Changes
              </IonButton>
              <IonButton expand="block" color="medium" onClick={() => setShowEditModal(false)}>
                Cancel
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showSuccessToast}
          onDidDismiss={() => setShowSuccessToast(false)}
          message="Success!"
          duration={2000}
          color="success"
          position="middle"
        />
        <IonToast
          isOpen={showErrorToast}
          onDidDismiss={() => setShowErrorToast(false)}
          message={submitError}
          duration={2000}
          color="danger"
          position="middle"
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab3;