import { useEffect, useState } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { StationsFile,Station, Props } from "./types";
import { List, ActionPanel, Action } from "@raycast/api";
import { StationDetail } from "./stationDetail";



// function validateStationsFile(data: any): asserts data is StationsFile {
//     if (typeof data !== "object" || data === null) {
//         throw new Error("Invalid JSON: expected object");
//     }

//     for (const key of ["from_center", "to_center"] as const) {
//         if (!Array.isArray(data[key])) {
//             throw new Error(`Invalid JSON: ${key} must be an array`);
//         }

//         for (const item of data[key]) {
//             if (
//                 typeof item !== "object" ||
//                 typeof item.name !== "string" ||
//                 typeof item.code !== "string"
//             ) {
//                 throw new Error(
//                     `Invalid JSON: each station in ${key} must have name and code`
//                 );
//             }
//         }
//     }
// }


async function readStationsFile(filePath: string): Promise<StationsFile> {
    const absolutePath = path.resolve(filePath);
    const text = await readFile(absolutePath, "utf-8");
    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        console.error("Failed to parse JSON:", err);
    }

    return data;
}

export default function Command(props: Props) {
    const [stations, setStation] = useState<Station[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { postaja } = props.arguments;
    const filePath = "C:/Users/krump/Develompent/lpp/assets/feed/postaje.json";

    useEffect(() => {
        async function load() {
            try {
                const data = await readStationsFile(filePath);

                // Combine all stations
                const allStations: Station[] = [
                    ...data.from_center.map((s) => ({ ...s, direction: "from_center" as const })),
                    ...data.to_center.map((s) => ({ ...s, direction: "to_center" as const })),
                ];

                // Filter for the one you care about
                const match = allStations.filter(
                    (s) => s.name.toLowerCase().startsWith(postaja.toLowerCase())
                );

                if (!match) {
                    setError(`Station "${postaja}" not found`);
                } else {
                    setStation( match);
                }
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [postaja, filePath]);
    if (error) {
        return <List.EmptyView title="Error" description={error} />;
    }

    return (
        <List isLoading={loading} searchBarPlaceholder="Search stations...">
      {stations.map((s) => (
        <List.Item
          key={s.code}
          title={s.name}
          subtitle={`• ${s.direction} | ${s.code}`}
          actions={
            <ActionPanel>
                <Action.Push
                title="Show Details"
                target={<StationDetail station={s} />}
                />
            </ActionPanel>
            }
        />
      ))}
    </List>
    );
}