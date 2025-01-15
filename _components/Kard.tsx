import { Card, CardHeader, CardBody, Typography, Button } from 'https://esm.run/@material-tailwind/react';
import Image from 'https://esm.run/next/image';
import "./styles.css";



function KardHeader(image_path, image_alt) {
  return (
    <>
      <CardHeader
        shadow={false}
        color="transparent"
        floated={false}
        className="m-0 w-2/5 shrink-0 rounded-r-none flex items-center justify-center"
      >
        <Image
          src={image_path}
          alt={`Logo ${image_alt}`}
          width={100}
          height={100}
          color="transparant"
          style={{
            width: "auto",
            height: "auto",
            maxHeight: "90%",
            objectFit: "contain",
          }}
        />
      </CardHeader>
    </>
  );
}


function KardBody(label, title, content, link, signature, pdf) {
  const t = useTranslations("Kards");
  return (
    <>
      <CardBody>
        <Typography variant="h6" color="gray" className="mb-4 uppercase">
          {label}
        </Typography>
        <Typography variant="h4" color="blue-gray" className="mb-2">
          {title}
        </Typography>
        <Typography color="gray" className="mb-8 font-normal">
          {content}
        </Typography>
        {pdf ? (
          <>
            <a href={link} className="inline-block" download>
              <Button variant="text" className="flex items-center gap-2">
                Yoyoyo
              </Button>
            </a>
            <a href={signature} className="inline-block" download>
              <Button variant="text" className="flex items-center gap-2">
                                YoyoyoYoyoyo
              </Button>
            </a>
          </>
        ) : (
          <a href={link} className="inline-block">
            <Button variant="text" className="flex items-center gap-2">
              {t("learn_more")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </Button>
          </a>
        )}
      </CardBody>
    </>
  );
}

/* export function Kard({
  header,
  header_left = true,
  body,
  bgcolor = color.Grad1,
}: Kard) {
  const classname = `rounded-md bg-${bgcolor} w-full max-w-[48rem] flex-row`;

  return (
    <Card shadow={false} className={classname}>
      {header_left ? (
        <>
          <KardHeader {...header} />
          <KardBody {...body} />
        </>
      ) : (
        <>
          <KardBody {...body} />
          <KardHeader {...header} />
        </>
      )}
    </Card>
  );
} */

export function Kard() {
  const bgcolor = 'carrara-100'
  const classname = `rounded-md bg-${bgcolor} w-full max-w-[48rem] flex-row`;

  return (
    <Card shadow={false} className={classname}>
            <><p>Yoyoy<p>Yoyoy</p></p></>
    </Card>
  );
}