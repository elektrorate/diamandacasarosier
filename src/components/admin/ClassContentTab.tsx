"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";
import RichTextField from "./RichTextField";
import type { ClassOfferingContent, ClassOfferingModule } from "@/lib/cms/types";

interface ClassContentTabProps {
  content: ClassOfferingContent;
  onChange: (content: ClassOfferingContent) => void;
  onDirty: () => void;
}

function defaultContent(): ClassOfferingContent {
  return {
    showCourseContent: undefined,
    showLearningSection: false,
    showParticipationSection: false,
    showPaymentMethodsSection: false,
    showModulesSection: false,
    learningSectionTitle: "",
    learningContent: "",
    participationSectionTitle: "",
    participationContent: "",
    paymentMethods: "",
    paymentMethodsList: [],
    contactWhatsapp: "",
    contactEmail: "",
    extraInfo: "",
    showEnrollButtonAtEnd: true,
    activitiesSection: { enabled: false, title: "", content: "", items: [] },
    modulesSectionTitle: "",
    modulesAccordionTitle: "",
    modules: [],
  };
}

function createModuleId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `mod-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="text-label-md font-bold uppercase tracking-wide text-on-surface-variant">
      {children}
    </label>
  );
}

function TextField({
  label,
  help,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; help?: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        {...props}
        className={`block w-full rounded-xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container ${
          error ? "border-error" : "border-outline-variant"
        }`}
      />
      {help && !error ? <p className="text-label-md text-on-surface-variant/70">{help}</p> : null}
      {error ? <p className="text-label-md text-error">{error}</p> : null}
    </div>
  );
}

export { defaultContent, type ClassOfferingContent };

export default function ClassContentTab({ content, onChange, onDirty }: ClassContentTabProps) {
  function update(field: keyof ClassOfferingContent, value: unknown) {
    onChange({ ...content, [field]: value });
    onDirty();
  }

  function updateModule(index: number, next: Partial<ClassOfferingModule>) {
    const modules = content.modules.map((item, i) => (i === index ? { ...item, ...next } : item));
    update("modules", modules);
  }

  function addModule() {
    const modules = [
      ...content.modules,
      { id: createModuleId(), title: `MÓDULO ${content.modules.length + 1}.`, description: "", order: content.modules.length },
    ];
    update("modules", modules);
  }

  function duplicateModule(index: number) {
    const current = content.modules[index];
    if (!current) return;
    const modules = [
      ...content.modules.slice(0, index + 1),
      { ...current, id: createModuleId(), title: current.title ? `${current.title} (copia)` : "", order: index + 1 },
      ...content.modules.slice(index + 1),
    ].map((item, order) => ({ ...item, order }));
    update("modules", modules);
  }

  function removeModule(index: number) {
    if (!window.confirm("¿Eliminar este módulo?")) return;
    const modules = content.modules.filter((_, i) => i !== index).map((item, order) => ({ ...item, order }));
    update("modules", modules);
  }

  const paymentMethods = content.paymentMethodsList?.length
    ? content.paymentMethodsList
    : content.paymentMethods.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

  function updatePaymentMethods(next: string[]) {
    const clean = next.map((item) => item.trim()).filter(Boolean);
    onChange({ ...content, paymentMethodsList: next, paymentMethods: clean.join("\n") });
    onDirty();
  }

  function addPaymentMethod() {
    updatePaymentMethods([...paymentMethods, ""]);
  }

  function updatePaymentMethod(index: number, value: string) {
    const next = paymentMethods.length ? [...paymentMethods] : [""];
    next[index] = value;
    onChange({ ...content, paymentMethodsList: next, paymentMethods: next.map((item) => item.trim()).filter(Boolean).join("\n") });
    onDirty();
  }

  function removePaymentMethod(index: number) {
    updatePaymentMethods(paymentMethods.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-6">
      {/* ── Bloque principal: Contenido del Curso ── */}
      <Card padding="lg" className="space-y-5 rounded-2xl">
        <h2 className="text-headline-sm text-on-surface">Contenido del Curso</h2>


        <Switch
          checked={content.showLearningSection}
          label="Mostrar ¿Qué aprenderás? en la página pública"
          description="El texto permanece guardado aunque esta sección esté oculta."
          onCheckedChange={(checked) => update("showLearningSection", checked)}
        />

        <TextField
          label="Título de la sección '¿Qué aprenderás?'"
          value={content.learningSectionTitle}
          placeholder="Estructura por módulos"
          onChange={(event) => update("learningSectionTitle", event.target.value)}
        />

        <RichTextField
          label="¿Qué aprenderás?"
          value={content.learningContent}
          onChange={(value) => update("learningContent", value)}
          minHeight="200px"
          placeholder="Módulo 1. Arcillas y propiedades de la materia cerámica.&#10;Módulo 2. Modelado manual y técnicas constructivas básicas."
        />

        <Switch
          checked={content.showParticipationSection}
          label="Mostrar ¿Quién puede participar? en la página pública"
          description="El texto permanece guardado aunque esta sección esté oculta."
          onCheckedChange={(checked) => update("showParticipationSection", checked)}
        />

        <TextField
          label="Título de la sección '¿Quién puede participar?'"
          value={content.participationSectionTitle}
          placeholder="QUE INCLUYE"
          onChange={(event) => update("participationSectionTitle", event.target.value)}
        />

        <RichTextField
          label="¿Quién puede participar?"
          value={content.participationContent}
          onChange={(value) => update("participationContent", value)}
          minHeight="200px"
          placeholder="Materiales básicos para cada clase (arcillas, engobes, esmaltes comerciales).&#10;Uso de herramientas y horno durante las sesiones presenciales."
        />

        <div className="space-y-3">
          <Switch
            checked={content.showPaymentMethodsSection}
            label="Mostrar Formas de pago en la página pública"
            description="Las formas permanecen guardadas aunque esta sección esté oculta."
            onCheckedChange={(checked) => update("showPaymentMethodsSection", checked)}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <FieldLabel>Formas de pago</FieldLabel>
              <p className="mt-1 text-label-md text-on-surface-variant/70">Se publicarán como lista con viñetas.</p>
            </div>
            <Button type="button" variant="outlined" size="sm" onClick={addPaymentMethod}>Añadir forma</Button>
          </div>
          {paymentMethods.length ? (
            <div className="space-y-2">
              {paymentMethods.map((method, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <TextField
                    label={`Forma ${index + 1}`}
                    value={method}
                    placeholder="Transferencia bancaria"
                    onChange={(event) => updatePaymentMethod(index, event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removePaymentMethod(index)}
                    className="self-end inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-label-md font-bold text-error transition-colors hover:bg-error-container"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-5 text-body-md text-on-surface-variant">
              No hay formas de pago añadidas.
            </div>
          )}
        </div>

        <RichTextField
          label="Información extra (opcional)"
          value={content.extraInfo}
          placeholder="Añade información adicional si es necesaria..."
          onChange={(value) => update("extraInfo", value)}
          minHeight="150px"
        />

      </Card>

      {/* ── Bloque: Módulos del Curso ── */}
      <Card padding="lg" className="space-y-5 rounded-2xl">
        <h2 className="text-headline-sm text-on-surface">Módulos del Curso</h2>

        <Switch
          checked={content.showModulesSection}
          label="Mostrar Módulos del Curso en la página pública"
          description="Los módulos permanecen guardados y editables aunque la sección esté oculta."
          onCheckedChange={(checked) => update("showModulesSection", checked)}
        />

        <TextField
          label="Título de la sección 'Contenido del curso'"
          value={content.modulesSectionTitle}
          placeholder="programa del curso"
          onChange={(event) => update("modulesSectionTitle", event.target.value)}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FieldLabel>Módulos</FieldLabel>
            <Button type="button" variant="outlined" size="sm" onClick={addModule}>+ Añadir módulo</Button>
          </div>

          {content.modules.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-secondary-container bg-secondary-container/10 px-6 py-12 text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-lowest text-secondary shadow-sm">
                <span className="material-symbols-outlined text-3xl">menu_book</span>
              </span>
              <h3 className="text-title-md font-bold text-on-surface">No hay módulos creados todavía.</h3>
              <Button type="button" variant="outlined" className="mt-4 border-secondary-container text-secondary" onClick={addModule}>
                + Añadir módulo
              </Button>
            </div>
          ) : (
            content.modules.map((mod, index) => (
              <div key={mod.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-label-md font-bold uppercase tracking-wide text-on-surface-variant">Módulo {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => duplicateModule(index)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                      Duplicar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModule(index)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-label-md font-semibold text-error transition-colors hover:bg-error-container"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <TextField
                    label="Título del módulo"
                    value={mod.title}
                    placeholder={`MÓDULO ${index + 1}. TÍTULO DEL MÓDULO`}
                    onChange={(event) => updateModule(index, { title: event.target.value })}
                  />
                  <RichTextField
                    label="Descripción del módulo"
                    value={mod.description}
                    placeholder="Objetivo: comprender la naturaleza técnica de las arcillas..."
                    onChange={(value) => updateModule(index, { description: value })}
                    minHeight="140px"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
