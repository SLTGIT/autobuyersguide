import { Fragment } from "react";
import {
  parseDealerCommentsBlocks,
  type DealerCommentBlock,
} from "@/lib/inventory/dealer-comments";

function RichParagraph({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split(/(\$\s*[\d,]+(?:\s*(?:PW|pw|\/\s*wk)\b)?)/gi);
  return (
    <p className={className}>
      {parts.map((part, i) =>
        /^\$\s*\d/i.test(part) ? (
          <strong key={i} className="dealer-comments__price">
            {part.replace(/\s+/g, " ").trim()}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </p>
  );
}

function renderBlock(block: DealerCommentBlock, key: number, paraIndex: number) {
  switch (block.type) {
    case "paragraph":
      return (
        <RichParagraph
          key={key}
          text={block.text}
          className={`dealer-comments__para${paraIndex === 0 ? " dealer-comments__para--lead" : ""}`}
        />
      );
    case "featureList":
      return (
        <ul key={key} className="dealer-comments__features" aria-label="Features">
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "vin":
      return (
        <div key={key} className="dealer-comments__vin">
          <span className="dealer-comments__vin-label">VIN</span>
          <code className="dealer-comments__vin-value">{block.value}</code>
        </div>
      );
    case "badges":
      return (
        <ul key={key} className="dealer-comments__badges" aria-label="Highlights">
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "hashtags":
      return (
        <div key={key} className="dealer-comments__tags" aria-label="Related tags">
          {block.tags.map((tag, t) => (
            <span key={`${t}-${tag}`} className="dealer-comments__tag">
              #{tag}
            </span>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default function VehicleDealerComments({
  text,
  hideHeading = false,
}: {
  text: string;
  hideHeading?: boolean;
}) {
  const blocks = parseDealerCommentsBlocks(text);
  if (blocks.length === 0) return null;

  let paraIndex = 0;
  return (
    <section
      className="inventory-vdp-comments vdp-dealer-comments dealer-comments"
      aria-labelledby={hideHeading ? undefined : "dealer-comments-heading"}
    >
      {hideHeading ? null : (
        <h2
          id="dealer-comments-heading"
          className="vdp-section-heading dealer-comments__heading"
        >
          Dealer comments
        </h2>
      )}
      <div className="inventory-vdp-comments-body dealer-comments__body">
        {blocks.map((block, i) => {
          if (block.type === "paragraph") {
            const el = renderBlock(block, i, paraIndex);
            paraIndex += 1;
            return el;
          }
          return renderBlock(block, i, paraIndex);
        })}
      </div>
    </section>
  );
}
