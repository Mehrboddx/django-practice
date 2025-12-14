import { IonContent, IonHeader, IonLabel, IonPage, IonTitle, IonToolbar,IonItem, IonLoading, IonButton, IonButtons } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { useEffect, useState } from 'react';
import './Tab3.css';
type Income = { date: string; total_amount: number };
type IncomeResponse = { incomes: Income[] };
const IncomeDetailPage: React.FC = () => {
  const [data, setData] = useState<IncomeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8009/q/income/?token=1234567');
        const result = (await response.json()) as IncomeResponse;
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
          <IonTitle>Income</IonTitle>
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
        {!loading && !error && data?.incomes?.map((item, idx) => (
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

export default IncomeDetailPage;
