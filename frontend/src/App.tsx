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

// Função simples para verificar se o usuário está logado
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

				{/* Rotas Privadas (Enclausuradas pelo Layout) */}
				<Route
					path="/"
					element={
						<PrivateRoute>
							<Layout />
						</PrivateRoute>
					}
				>
					<Route index element={<Navigate to="/apartamentos" replace />} />
					<Route path="apartamentos" element={<Apartamentos />} />
					<Route path="apartamentos/novo" element={<ApartamentosCreate />} />
					<Route path="apartamentos/:id" element={<ApartamentoDetalhes />} />
					<Route path="clientes" element={<ClientesList />} />
					<Route path="clientes/novo" element={<ClientesCreate />} />
					<Route path="reservas" element={<ReservasList />} />
					<Route path="reservas/novo" element={<ReservasCreate />} />
					<Route path="reservas/:id" element={<ReservaDetalhes />} />
					<Route
						path="vendas"
						element={
							<div>
								<h2>Vendas</h2>
							</div>
						}
					/>
				</Route>

				{/* Fallback para rotas não encontradas */}
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
