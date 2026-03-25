import { useParams } from "react-router-dom";
import { SPECIFIC_TEMPLATE_MAP } from "../templates/registry";

export default function TemplatePreview() {
  const { templateId } = useParams();

  const Template = SPECIFIC_TEMPLATE_MAP[templateId];

  if (!Template) {
    return <div style={{ padding: 40 }}>Template not found</div>;
  }

  return (
    <div
      id="resume-preview"
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "white",
      }}
    >
      <Template />
    </div>
  );
}