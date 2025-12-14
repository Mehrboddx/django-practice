import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar , IonLabel,IonLoading, IonItem, IonButtons, IonButton, useIonViewWillEnter} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { useEffect, useState } from 'react';
import './Tab2.css';
import { useHistory } from 'react-router-dom';
type item = { sum_amount: number , avg_amount: number , count: number};
type items = { income: item , expense: item};
const Tab2: React.FC = () => { 
  const [data, setData] = useState<items | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const Token = localStorage.getItem('token') || '';
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.replace('/login');
  };
  useIonViewWillEnter(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8009/q/general_stats/?token=${Token}`);
      const result = (await response.json()) as items;
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
});
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Status</IonTitle>
          <IonButtons slot="end">
          <IonButton onClick={handleLogout}>Logout</IonButton>
        </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonItem routerLink="/income-detail">
          <IonLabel>
            <h2>Income Summary</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {!loading && !error && data && (
              <>
                <p>Total Amount: ${data.income.sum_amount.toFixed(2)}</p>
                <p>Average Amount: ${data.income.avg_amount.toFixed(2)}</p>
                <p>Count: {data.income.count}</p>
              </>
            )}
          </IonLabel>
        </IonItem>
        <IonItem routerLink="/expense-detail">
          <IonLabel>
            <h2>Expense Summary</h2>
            <IonLoading
                        isOpen={loading}
                        message="Loading expenses..."
                        spinner="crescent"
                        backdropDismiss={false}
                    />
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {!loading && !error && data && (
              <>
                <p>Total Amount: ${data.expense.sum_amount.toFixed(2)}</p>
                <p>Average Amount: ${data.expense.avg_amount.toFixed(2)}</p>
                <p>Count: {data.expense.count}</p>
              </>
            )}
          </IonLabel>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
