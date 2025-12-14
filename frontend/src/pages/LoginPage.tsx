import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonToast,
  IonLoading
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Tab1.css';

const LoginPage: React.FC = () => {
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8009/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', result.token);
      
      // Redirect to tabs
      history.push('/tabs/tab2');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <form onSubmit={handleLogin} style={{ marginTop: 32 }}>
          <IonItem>
            <IonInput
              type="text"
              value={username}
              placeholder='Username'
              onIonChange={e => setUsername(e.detail.value || '')}
              required
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="password"
              value={password}
              onIonChange={e => setPassword(e.detail.value || '')}
              placeholder='Password'
              required
            />
          </IonItem>
          <div style={{ marginTop: 20 }}>
            <IonButton type="submit" expand="block" disabled={loading}>
              Sign In
            </IonButton>
          </div>
        </form>
      </IonContent>

      <IonToast
        isOpen={showError}
        onDidDismiss={() => setShowError(false)}
        message={error}
        duration={3000}
        color="danger"
        position="middle"
      />
      <IonLoading isOpen={loading} message="Logging in..." />
    </IonPage>
  );
};

export default LoginPage;