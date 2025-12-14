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
  useIonViewWillEnter,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonIcon,
  IonModal
} from '@ionic/react';
import { useState } from 'react';
import { trash, pencil, close } from 'ionicons/icons';
import './Tab1.css';

type Expense = { id?: number; date: string; amount: number; text: string };

const TOKEN = localStorage.getItem('token') || '';

const Tab1: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editText, setEditText] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`http://localhost:8009/q/expense_history/?token=${TOKEN}`);
      const result = await response.json();
      setExpenses(result.expenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  useIonViewWillEnter(() => {
    fetchExpenses();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);
    try {
      const response = await fetch('http://localhost:8009/submit/expense/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: TOKEN, amount, text, date }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setShowSuccessToast(true);
      setAmount('');
      setText('');
      setDate('');
      await fetchExpenses();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
      setShowErrorToast(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingId(expense.id || null);
    setEditAmount(String(expense.amount));
    setEditText(expense.text);
    setEditDate(expense.date);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const response = await fetch('http://localhost:8009/update_expense/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: TOKEN,
          expense_id: String(editingId),
          amount: editAmount,
          text: editText,
          date: editDate
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setShowEditModal(false);
      setEditingId(null);
      setShowSuccessToast(true);
      await fetchExpenses();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
      setShowErrorToast(true);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      const response = await fetch('http://localhost:8009/delete_expense/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: TOKEN, expense_id: String(id) }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setShowSuccessToast(true);
      await fetchExpenses();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
      setShowErrorToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Expense</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* FORM SECTION */}
        <form onSubmit={handleSubmit} style={{ marginTop: 16, marginBottom: 30 }}>
          <IonItem>
            <IonInput
              type="number"
              value={amount}
              placeholder="Amount"
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
              placeholder="Date"
              onIonChange={e => setDate(e.detail.value || '')}
              required
            />
          </IonItem>
          <IonButton type="submit" expand="block" disabled={submitLoading} style={{ marginTop: 12 }}>
            Submit Expense
          </IonButton>
        </form>

        {/* EXPENSES LIST SECTION */}
        <IonLabel style={{ marginTop: 20, fontWeight: 'bold' }}>Existing Expenses:</IonLabel>
        {expenses.map((expense) => (
          <IonItemSliding key={expense.id}>
            <IonItem>
              <IonLabel>
                <h2>{expense.date}</h2>
                <p>${expense.amount.toFixed(2)}</p>
                <p>{expense.text}</p>
              </IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption color="primary" onClick={() => handleEditClick(expense)}>
                <IonIcon slot="icon-only" icon={pencil} />
              </IonItemOption>
              <IonItemOption color="danger" onClick={() => handleDelete(expense.id)}>
                <IonIcon slot="icon-only" icon={trash} />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}

        {/* EDIT MODAL */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Expense</IonTitle>
              <IonButton slot="end" onClick={() => setShowEditModal(false)}>
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
                  onIonChange={e => setEditDate(e.detail.value || '')}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  type="number"
                  value={editAmount}
                  onIonChange={e => setEditAmount(e.detail.value || '')}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  type="text"
                  value={editText}
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

        {/* TOASTS */}
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
          duration={3000}
          color="danger"
          position="middle"
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;