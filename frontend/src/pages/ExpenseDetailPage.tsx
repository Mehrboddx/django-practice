import { IonButtons,IonButton, IonContent, IonHeader, IonItem, IonLabel, IonLoading, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { useEffect, useState } from 'react';
import './Tab1.css';

type Expense = { date: string; total_amount: number };
type ExpenseResponse = { expenses: Expense[] };
const ExpenseDetailPage: React.FC = () => {
  const [data, setData] = useState<ExpenseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8009/q/expense/?token=1234567');
        const result = (await response.json()) as ExpenseResponse;
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Expense</IonTitle>
          <IonButtons slot = "end">
          <IonButton onClick={() => window.history.back()}>back</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonLoading
            isOpen={loading}
            message="Loading expenses..."
            spinner="crescent"
            backdropDismiss={false}
        />
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && data?.expenses?.map((item, idx) => (
          <IonItem key={idx}>
            <IonLabel>
              <h2>{item.date}</h2>
              <p>${item.total_amount}</p>
            </IonLabel>
          </IonItem>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default ExpenseDetailPage;
