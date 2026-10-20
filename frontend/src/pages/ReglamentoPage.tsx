import LegalPageLayout, { LegalSection } from '../components/common/LegalPageLayout'

export default function ReglamentoPage(): React.JSX.Element {
  return (
    <LegalPageLayout
      eyebrow="Copa 5 · Reglamento"
      title="Reglamento del complejo"
      intro="Las reglas de juego, uso de las instalaciones y convivencia que aplican a todos los turnos y torneos."
      updatedAt="octubre de 2026"
    >
      <LegalSection title="1. Reservas y horarios">
        <ul className="list-disc space-y-1 pl-5">
          <li>Los turnos duran 60 minutos y se reservan desde la web. La seña confirma la reserva.</li>
          <li>
            Una reserva sin seña queda pendiente y puede liberarse automáticamente para otro equipo.
          </li>
          <li>
            Llegá 10 minutos antes del horario. Pasada la tolerancia de 10 minutos, la cancha puede
            cederse.
          </li>
          <li>
            El turno termina en el horario reservado, aunque el equipo haya llegado tarde o haya
            menos jugadores.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Indumentaria y calzado">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Solo se permite calzado deportivo apto para césped sintético. Quedan prohibidos los
            tapones metálicos y las suelas de asfalto o running: marcan el césped y generan
            lesiones.
          </li>
          <li>Se recomienda usar canilleras. No se juega sin camiseta.</li>
          <li>Sin relojes, cadenas, anillos ni objetos rígidos durante el partido.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Conducta y juego limpio">
        <ul className="list-disc space-y-1 pl-5">
          <li>Respetá a los rivales, a los árbitros y al personal del complejo.</li>
          <li>
            No se toleran insultos, amenazas ni agresiones: la persona implicada puede ser expulsada
            y suspendida de los torneos.
          </li>
          <li>Está prohibido jugar bajo los efectos del alcohol o de sustancias prohibidas.</li>
          <li>
            La administración puede suspender un partido si las condiciones ponen en riesgo a los
            jugadores.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Uso de las instalaciones">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Vestuarios y duchas: dejalos en orden después de usarlos. El complejo no se hace
            responsable por objetos de valor.
          </li>
          <li>No se permite fumar ni vapear en la cancha, los vestuarios ni los sectores cubiertos.</li>
          <li>No ingreses con bebidas alcohólicas, vidrios ni latas a la cancha.</li>
          <li>No muevas arcos, redes ni mobiliario sin autorización.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Torneos">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            La inscripción se hace por equipo con lista de buena fe. Se pueden sumar jugadores hasta
            la fecha 2.
          </li>
          <li>
            La tolerancia para presentarse es de 10 minutos. Si el equipo no se presenta, pierde el
            partido por walkover.
          </li>
          <li>
            Dos tarjetas amarillas en un mismo partido implican expulsión; la roja implica al menos
            una fecha de suspensión.
          </li>
          <li>El fixture, las tablas y los goleadores se publican en la sección Torneos.</li>
          <li>Los reclamos se presentan por escrito dentro de las 48 horas del partido.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Consultas y casos no previstos">
        <p>
          Las dudas sobre situaciones que no estén contempladas acá las resuelve la administración
          del complejo. Podés escribirnos por WhatsApp o consultar en recepción, de 8 a 23 h.
        </p>
        <p>La versión vigente del reglamento es la publicada en esta página.</p>
      </LegalSection>
    </LegalPageLayout>
  )
}
