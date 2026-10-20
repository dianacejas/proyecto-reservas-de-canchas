import LegalPageLayout, { LegalSection } from '../components/common/LegalPageLayout'

export default function PoliticaCancelacionPage(): React.JSX.Element {
  return (
    <LegalPageLayout
      eyebrow="Copa 5 · Reservas"
      title="Política de cancelación"
      intro="Cómo funcionan las cancelaciones, las reprogramaciones y las devoluciones de los turnos y de las inscripciones a los torneos."
      updatedAt="octubre de 2026"
    >
      <LegalSection title="1. Cancelación por parte del jugador">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="font-semibold text-coffee dark:text-[#f3efe8]">
              Más de 24 horas antes:
            </strong>{' '}
            reprogramación sin cargo o devolución del 100% de la seña.
          </li>
          <li>
            <strong className="font-semibold text-coffee dark:text-[#f3efe8]">
              Entre 24 y 6 horas antes:
            </strong>{' '}
            la seña no se devuelve, pero podés reprogramar el turno dentro de los 30 días según
            disponibilidad.
          </li>
          <li>
            <strong className="font-semibold text-coffee dark:text-[#f3efe8]">
              Menos de 6 horas antes o ausencia:
            </strong>{' '}
            se pierde la seña y no corresponde reprogramación.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Cancelación por parte del complejo">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Si no podemos garantizar la cancha por lluvia, mantenimiento o fuerza mayor, te avisamos
            lo antes posible y elegís entre reprogramar sin cargo o la devolución del 100%.
          </li>
          <li>El aviso se hace por WhatsApp y al email registrado en la reserva.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Reprogramaciones">
        <ul className="list-disc space-y-1 pl-5">
          <li>Hasta 24 horas antes del turno, la reprogramación no tiene cargo.</li>
          <li>
            Después de ese plazo queda sujeta a disponibilidad y, si el nuevo horario tiene una
            tarifa mayor, se abona la diferencia.
          </li>
          <li>Se permite una reprogramación por turno.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Cómo cancelar">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Con la sesión iniciada, desde <strong>Mis Reservas</strong>; también por WhatsApp.
          </li>
          <li>
            La cancelación queda firme cuando el complejo la confirma por el mismo canal en el que
            la recibió.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Reembolsos">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Se procesan por Mercado Pago al mismo medio de pago utilizado. La acreditación depende de
            los plazos de Mercado Pago, habitualmente entre 5 y 10 días hábiles.
          </li>
          <li>
            Si preferís, el importe puede quedar como saldo a favor para otro turno dentro de los 30
            días.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Inscripciones a torneos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Baja hasta 7 días antes del inicio: devolución del 100% de la inscripción.</li>
          <li>Baja entre 7 días y 48 horas antes del inicio: 50% de devolución o crédito total.</li>
          <li>Después del inicio del torneo no corresponde devolución.</li>
          <li>Si un equipo se retira durante el torneo, tampoco corresponde devolución.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Casos especiales">
        <p>
          Ante lesiones o emergencias, escribinos con el comprobante correspondiente: evaluamos cada
          caso con la administración del complejo.
        </p>
        <p>
          Estas condiciones pueden actualizarse. La versión vigente es la publicada en esta página.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
