import { ActionPanel, Action, List } from "@raycast/api";
import { Route, RoutesOnStationResponse, Station } from "./types";
import { Timetable } from "./timetable";
import { useEffect, useState } from "react";
import { BASE_URL } from "./consts";

function isRoutesOnStationResponse(
  value: any
): value is RoutesOnStationResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.success === "boolean" &&
    Array.isArray(value.data)
  );
}

async function fetchStationDetail(station_code: string): Promise<Route[]> {
  try {
    const response = await fetch(
      `${BASE_URL}station/routes-on-station?station-code=${station_code}`
    );

    const json: unknown = await response.json();

    if (!isRoutesOnStationResponse(json) || !json.success) {
      return [];
    }
    let id = 0;
    return json.data
    .map((d): Route => ({
      id: id++,
      route_number: d.route_number,
      route_name: d.route_name,
      is_garage: d.is_garage,
    }))
    .filter(d => !d.is_garage)
    .filter(d => d.route_name != null);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function StationDetail({ station }: { station: Station }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStationDetail(station.code);
        if (data) {
          setRoutes(data);
        }
      } catch (e) {
        setError((e as Error).message);
        console.log(e)
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [station])

  if (error) {
    return <List.EmptyView title="Error" description={error} />;
  }
  let route_key = 0;

  return (
    <List
      isLoading={loading}
      searchBarPlaceholder="Search routes..."
      navigationTitle={`${station.name}• ${station.code}`}
    >
      {routes.map((route) => (
        <List.Item
          key={route_key++}
          title={route.route_name}
          subtitle={`• ${route.route_number}`}
          actions={
            <ActionPanel>
              <Action.Push
                title="Show Details"
                target={<Timetable route={route} station_code={station.code}/>}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}