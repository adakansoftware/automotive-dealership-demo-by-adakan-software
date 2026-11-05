'use client'

/** Onay isteyen gönderme butonu — silme gibi geri alınamaz aksiyonlar için. */
export function ConfirmSubmit({ label, confirmText }: { label: string; confirmText: string }) {
  return <button
    type="submit"
    className="admin-button-danger"
    onClick={(event) => {
      if (!window.confirm(confirmText)) event.preventDefault()
    }}
  >
    {label}
  </button>
}
