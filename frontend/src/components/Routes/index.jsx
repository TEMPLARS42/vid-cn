import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import UnprotectedRoutes from "./UnprotectedRoutes";
import Loader from "../Loader";
import { Suspense } from "react";
import Header from "../Header";
import { isUserExists } from "../../util";

const Routes = () => {
    const routes = isUserExists()
        ? ProtectedRoutes
        : UnprotectedRoutes

    const router = createBrowserRouter([{
        element: <Header />,
        children: routes,
    }], {
        basename: "/", future: {
            v7_fetcherPersist: true,
            v7_normalizeFormMethod: true,
            v7_partialHydration: true,
            v7_relativeSplatPath: true,
            v7_skipActionErrorRevalidation: true,
        }
    });

    return (
        <Suspense fallback={<Loader isLoading />}>
            <RouterProvider router={router} future={{
                v7_startTransition: true,
            }} />
        </Suspense>
    )
}

export default Routes