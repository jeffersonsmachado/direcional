// src/components/Layout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem("direcional_token");
		navigate("/login");
	};

	return (
		<div style={{ display: "flex", minHeight: "100vh" }}>
			{/* Barra Lateral de Navegação */}
			<aside
				style={{
					width: "240px",
					background: "#1e293b",
					color: "white",
					padding: "20px",
					display: "flex",
					flexDirection: "column",
					gap: "15px",
				}}
			>
				<h3>Direcional ERP</h3>
				<nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					<Link
						to="/apartamentos"
						style={{ color: "white", textDecoration: "none" }}
					>
						Apartamentos
					</Link>
					<Link
						to="/clientes"
						style={{ color: "white", textDecoration: "none" }}
					>
						Clientes
					</Link>
					<Link
						to="/reservas"
						style={{ color: "white", textDecoration: "none" }}
					>
						Reservas
					</Link>
					<Link to="/vendas" style={{ color: "white", textDecoration: "none" }}>
						Vendas
					</Link>
					<Link
						to="/usuarios"
						style={{
							color: "#93c5fd",
							textDecoration: "none",
							marginTop: "15px",
							borderTop: "1px solid #334155",
							paddingTop: "15px",
						}}
					>
						⚙️ Operadores
					</Link>
				</nav>
				<button
					onClick={handleLogout}
					style={{
						marginTop: "auto",
						padding: "8px",
						background: "#ef4444",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					Sair
				</button>
			</aside>

			{/* Conteúdo da Página */}
			<main style={{ flex: 1, padding: "20px", background: "#f8fafc" }}>
				<Outlet />
			</main>
		</div>
	);
}
