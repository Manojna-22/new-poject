import { useState } from 'react'

/**
 * AckButton — required by Week 2 spec.
 * Disabled unless alarm state is ACTIVE. Provides loading + handles errors via onAck callback.
 */
export default function AckButton({ alarm, onAck, disabled }) {
  const [loading, setLoading] = useState(false)

  const isActive = alarm.currentState === 'ACTIVE'
  const isDisabled = disabled || !isActive || loading

  const handle = async () => {
    if (isDisabled) return
    setLoading(true)
    try {
      await onAck(alarm)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className="btn-ack"
      onClick={handle}
      disabled={isDisabled}
      title={isActive ? 'Acknowledge this alarm' : `Cannot acknowledge — state is ${alarm.currentState}`}
    >
      {loading ? '...' : 'ACK'}
    </button>
  )
}
