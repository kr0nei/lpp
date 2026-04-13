import { useEffect, useState } from "react";
import { BASE_URL } from "./consts";
import { Route, TimelineData, TimelineResponse } from "./types";
import { Icon, List } from "@raycast/api";

function isTimelineResponse(value: any): value is TimelineResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof value.success === "boolean" &&
        typeof value.data === "object" &&
        value.data !== null &&
        typeof value.data.station === "object" &&
        Array.isArray(value.data.route_groups)
    );
}

async function getTimeline(station_code: string, route_group_number: string, next_hours?: number, previous_hours?: number): Promise<TimelineData | null> {
    if (next_hours == undefined) {
        next_hours = 12;
    }
    if (previous_hours == undefined) {
        previous_hours = 12;
    }
    try {
        const response = await fetch(
            `${BASE_URL}station/timetable?station-code=${station_code}&route-group-number=${route_group_number}&next-hours=${next_hours}&previous-hours=${previous_hours}`
        );

        const json: unknown = await response.json();

        if (!isTimelineResponse(json) || !json.success) {
            return null;
        }

        return json.data;
    } catch (err) {
        console.error(err);
        return null;
    }
}
function constructMinutes(minutes: number[]): string {
    let s = "";
    minutes.forEach(min => {
        s += `${min}min | `
    });
    return s.slice(0, -3);
}

export function Timetable({ route, station_code }: { route: Route, station_code: string }) {
    const [timetable, setTimetable] = useState<TimelineData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getTimeline(station_code, route.route_number, 6, 2);
                if (data) {
                    setTimetable(data);
                }
            } catch (e) {
                setError((e as Error).message);
                console.log(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [route])
    let route_key = 0;
    let timeline_key = 0;
    if (error) {
        return <List.EmptyView title="Error" description={error} />;
    }
    return (
        <List isLoading={loading} searchBarPlaceholder="Search departures..."
            navigationTitle={`Timetable for ${route.route_name}`}
        >
            {timetable?.route_groups[0]?.routes.map((timelines) => (
                <List.Section
                    title={`${timelines.parent_name}`}
                    key={route_key++}>
                    {timelines.timetable.map((entries) => (
                        <List.Item
                            key={timeline_key++}
                            title={`${entries.hour}`}
                            subtitle={constructMinutes(entries.minutes)}
                            accessories={
                                entries.is_current
                                    ? [{ icon: Icon.Star, tooltip: "Next departure" }]
                                    : []
                            }
                        />
                    ))}
                </List.Section>
            ))}
        </List>
    );
}