alter table if exists public.offerings
  alter column details type jsonb using details::jsonb;

comment on column public.offerings.details is
  'JSONB CMS details. details.class supports heroMenuColor, heroMenuScale, showConsultCta, showEnrollCta, scheduleDescription, content.paymentMethodsList, heroImage/titleImage/titleImageSecondary.';
