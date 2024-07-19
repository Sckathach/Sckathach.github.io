import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  IconButton,
} from '@material-tailwind/react'
import './styles.css'

export enum color {
  PrimaryLow = 'carrara-100',
  PrimaryHigh = 'carrara-400'
}
export interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  date: string;
  bgcolor?: color;
  children: React.ReactNode;
}


export function InfoCard({ icon: Icon, title, date, bgcolor = color.PrimaryLow, children }: InfoCardProps) {
  const classname = `rounded-md bg-${bgcolor}`
  return (
    <Card shadow={false} className={classname}>
      <CardHeader
        className="flex items-center justify-between rounded-none overflow-visible"
        floated={false}
        shadow={false}
        color="transparent"
      >
        <div className="flex flex-col gap-1 w-full">
          <Typography color="blue" className="font-bold text-xs">
            {date}
          </Typography>
          <Typography color="blue-gray" variant="h5" className="w-full">
            {title}
          </Typography>
        </div>
        <IconButton
          className="flex-shrink-0 pointer-events-none"
          ripple={false}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </IconButton>
      </CardHeader>
      <CardBody className="grid justify-start !px-3.5 pt-2">
        <Typography className=" font-normal !text-gray-500">
          {children}
        </Typography>
      </CardBody>
    </Card>
  );
}

export default InfoCard;
