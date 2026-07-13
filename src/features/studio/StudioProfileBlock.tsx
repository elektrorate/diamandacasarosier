import { MarkdownContent } from "@/components/ui/MarkdownContent";

export function StudioProfileBlock({
  name,
  role,
  image,
  intro
}: {
  name: string;
  role: string;
  image: string;
  intro: string;
}) {
  return (
    <article className="studio-profile">
      <div className="studio-profile__media">
        <img src={image} alt={`${name} en el estudio de ceramica`} />
      </div>
      <div className="studio-profile__copy">
        <h2>{name}</h2>
        <p className="studio-profile__role">
          {role}
        </p>
        <MarkdownContent source={intro} />
      </div>
    </article>
  );
}
