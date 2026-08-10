import Image from "next/image";

type CrestProps = {
  /** Width in pixels. Height scales proportionally (razão do logo oficial). */
  size?: number;
  className?: string;
};

// Proporção do símbolo oficial (public/crest.png): 2062 x 1533.
const RATIO = 1533 / 2062;

/** Brasão oficial da Central School (imagem PNG em public/crest.png). */
export function Crest({ size = 96, className }: CrestProps) {
  return (
    <Image
      src="/crest.png"
      alt="Central School"
      width={size}
      height={Math.round(size * RATIO)}
      className={className}
      priority
    />
  );
}
