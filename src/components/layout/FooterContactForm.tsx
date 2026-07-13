"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function FooterContactForm({ preview = false }: { preview?: boolean }) {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const fieldProps = preview
    ? { disabled: true, required: false }
    : { required: true };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState("submitting");
    setMessage("");

    const response = await fetch("/api/forms/footer-contact/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        subject: "Mensaje desde footer",
        message: formData.get("message"),
        source_page: window.location.pathname,
        data: Object.fromEntries(formData.entries()),
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    if (response.ok) {
      form.reset();
      setState("success");
      setMessage(data.message || "Gracias, recibimos tu mensaje.");
      return;
    }

    setState("error");
    setMessage(data.error || "No se pudo enviar el mensaje. Intentalo de nuevo.");
  }

  const content = (
    <>
      <div className="contact-form__row">
        <div>
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            className="contact-form__input"
            name={preview ? undefined : "name"}
            type="text"
            placeholder="Nombre"
            {...fieldProps}
          />
        </div>
        <div>
          <label htmlFor="email">Correo electronico *</label>
          <input
            id="email"
            className="contact-form__input"
            name={preview ? undefined : "email"}
            type="email"
            placeholder="Correo electronico *"
            {...fieldProps}
          />
        </div>
      </div>
      <div>
        <label htmlFor="telefono">Numero de telefono</label>
        <input
          id="telefono"
          className="contact-form__input"
          name={preview ? undefined : "phone"}
          type="tel"
          placeholder="Numero de telefono"
          {...fieldProps}
        />
      </div>
      <div>
        <label htmlFor="comentario">Comentario</label>
        <textarea
          id="comentario"
          className="contact-form__textarea"
          name={preview ? undefined : "message"}
          placeholder="Comentario"
          {...fieldProps}
        />
      </div>
      <button className="contact-form__submit" type={preview ? "button" : "submit"} disabled={preview || state === "submitting"}>
        {state === "submitting" ? "Enviando..." : "Enviar"}
      </button>
      {message ? (
        <p className={`contact-form__status contact-form__status--${state}`} role="status">
          {message}
        </p>
      ) : null}
    </>
  );

  if (preview) {
    return (
      <div className="contact-form" aria-label="Formulario de contacto del footer">
        {content}
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {content}
    </form>
  );
}
