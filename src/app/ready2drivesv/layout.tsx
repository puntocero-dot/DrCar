import { RentalNavbar } from "@/components/ready2drivesv/RentalNavbar";

export default function RentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <RentalNavbar />
      <main>
        {children}
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter text-white">
              READY2DRIVE<span className="text-emerald-500">SV</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-xs">
              Tu servicio de alquiler de vehículos premium en El Salvador.
              Confiabilidad, rapidez y las mejores tarifas del mercado.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-zinc-500 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Catálogo de Autos</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Términos y Condiciones</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Contacto</h3>
            <ul className="space-y-2 text-zinc-500 text-sm">
              <li>soporte@ready2drive.sv</li>
              <li>+503 2222-2222</li>
              <li>San Salvador, El Salvador</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-900 text-center text-zinc-600 text-xs">
          <p>© 2024 Ready2DriveSV. Módulo Independiente de AutoMaster AI.</p>
        </div>
      </footer>
    </div>
  );
}
