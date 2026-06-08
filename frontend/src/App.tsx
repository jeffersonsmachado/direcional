// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Apartamentos from "./pages/Apartamentos/List";
import ApartamentoDetalhes from "./pages/Apartamentos/Details";
import ApartamentosCreate from "./pages/Apartamentos/Create"; // ← Importe a nova página
import ClientesList from "./pages/Clientes/List";
import ClientesCreate from "./pages/Clientes/Create";
import ReservasList from "./pages/Reservas/List";
import ReservasCreate from "./pages/Reservas/Create";
import ReservaDetalhes from "./pages/Reservas/Details";
import VendasList from "./pages/Vendas/List";
import VendasCreate from "./pages/Vendas/Create";
import VendaDetalhes from "./pages/Vendas/Details";
import UsuariosList from "./pages/Usuarios/List";
import UsuariosCreate from "./pages/Usuarios/Create";

const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
	const isAuthenticated = !!localStorage.getItem("direcional_token");
	return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Rota Pública */}
				<Route path="/login" element={<Login />} />

				{/* Rotas Privadas */}
				<Route
					path="/"
					element={
						<PrivateRoute>
							<Layout />
						</PrivateRoute>
					}
				>
					<Route index element={<Navigate to="/login" replace />} />
					<Route path="apartamentos" element={<Apartamentos />} />
					<Route path="apartamentos/novo" element={<ApartamentosCreate />} />
					<Route path="apartamentos/:id" element={<ApartamentoDetalhes />} />
					<Route path="clientes" element={<ClientesList />} />
					<Route path="clientes/novo" element={<ClientesCreate />} />
					<Route path="reservas" element={<ReservasList />} />
					<Route path="reservas/novo" element={<ReservasCreate />} />
					<Route path="reservas/:id" element={<ReservaDetalhes />} />
					<Route path="vendas" element={<VendasList />} />
					<Route path="vendas/novo" element={<VendasCreate />} />
					<Route path="vendas/:id" element={<VendaDetalhes />} />
					<Route path="usuarios" element={<UsuariosList />} />
					<Route path="usuarios/novo" element={<UsuariosCreate />} />
				</Route>

				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
