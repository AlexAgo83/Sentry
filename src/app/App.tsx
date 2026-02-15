import "./styles/app.css";
import { AppContainer } from "./AppContainer";
import { CloudSaveProvider } from "./hooks/useCloudSave";

export const App = () => {
    return (
        <CloudSaveProvider>
            <AppContainer />
        </CloudSaveProvider>
    );
};
