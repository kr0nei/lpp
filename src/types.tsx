export type Station = {
    name: string;
    code: string;
    direction: "from_center" | "to_center";
};
export type Route = {
    id: number,
    route_number: string,
    route_name: string,
    is_garage: boolean
}

export type StationsFile = {
    from_center: Station[];
    to_center: Station[];
};
export type Props = {
    arguments: {
        postaja: string;
    };
};

export type RoutesOnStationResponse = {
  success: boolean;
  data: {
    route_number: string;
    route_name: string;
    is_garage: boolean;
  }[];
};

export type TimelineResponse = {
  success: boolean;
  data: TimelineData;
};

export type TimelineData = {
  station: Station;
  route_groups: RouteGroup[];
};

type RouteGroup = {
  route_group_number: string;
  routes: RouteTimeline[];
};

type RouteTimeline = {
  timetable: TimetableEntry[];
  stations: RouteStation[];
  name: string;
  parent_name: string;
  group_name: string;
  route_number_suffix: string;
  route_number_prefix: string;
  is_garage: boolean;
};

type TimetableEntry = {
  hour: number;
  minutes: number[];
  is_current: boolean;
  timestamp: string; // ISO string
};

type RouteStation = {
  ref_id: string;
  name: string;
  order_no: number;
};