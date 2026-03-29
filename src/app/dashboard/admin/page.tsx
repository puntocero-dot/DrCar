export default function AdminDashboard() {
  return (
    <div className="flex-1 p-8 bg-navy-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl">
          <p className="text-steel-300">Bienvenido al panel de administración. Aquí podrás gestionar citas, clientes y operaciones del taller.</p>
        </div>
      </div>
    </div>
  )
}
