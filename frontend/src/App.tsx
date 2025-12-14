import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { card, trendingUp, statsChart } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import IncomeDetailPage from './pages/IncomeDetailPage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import LoginPage from './pages/LoginPage';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
  <IonReactRouter>
    <IonRouterOutlet>
      <Route exact path="/login" component={LoginPage} />

      <Route path="/tabs">
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tabs/tab1" component={Tab1} />
            <Route exact path="/tabs/tab2" component={Tab2} />
            <Route exact path="/tabs/tab3" component={Tab3} />
            <Route exact path="/tabs">
              <Redirect to="/tabs/tab1" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tabs/tab1"><IonIcon aria-hidden="true" icon={card} /><IonLabel>Expense</IonLabel></IonTabButton>
            <IonTabButton tab="tab2" href="/tabs/tab2"><IonIcon aria-hidden="true" icon={statsChart} /><IonLabel>Status</IonLabel></IonTabButton>
            <IonTabButton tab="tab3" href="/tabs/tab3"><IonIcon aria-hidden="true" icon={trendingUp} /><IonLabel>Income</IonLabel></IonTabButton>
          </IonTabBar>
        </IonTabs>
      </Route>

      <Route exact path="/">
        <Redirect to="/login" />
      </Route>
      <Route path="/income-detail" component={IncomeDetailPage} />
      <Route path="/expense-detail" component={ExpenseDetailPage} />
    </IonRouterOutlet>
  </IonReactRouter>
</IonApp>
);

export default App;
