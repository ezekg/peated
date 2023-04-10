import {
  AccountCircle as AccountCircleIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardHeader,
  TextField,
  debounce,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { Bottle } from "../types";

import { Form, useLocation } from "react-router-dom";
import api from "../lib/api";
import { useEffect, useState } from "react";

export default function Search() {
  const location = useLocation();
  const qs = new URLSearchParams(location.search);

  const [query, setQuery] = useState(qs.get("q") || "");
  const [results, setResults] = useState<readonly Bottle[]>([]);

  const fetch = debounce((query: string) => {
    api
      .get("/bottles", {
        query: { query },
      })
      .then((r: readonly Bottle[]) => setResults(r));
  });

  useEffect(() => {
    const qs = new URLSearchParams(location.search);

    setQuery(qs.get("q") || "");
  }, [location.search]);

  // TODO(dcramer): why is this rendering twice
  useEffect(() => {
    fetch(query);
  }, [query]);

  return (
    <Box>
      <Form method="GET">
        <Box
          sx={{ display: "flex", alignItems: "flex-end", py: 4, width: "100%" }}
        >
          <AccountCircleIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <TextField
            label="Search"
            variant="standard"
            name="q"
            sx={{ flex: 1 }}
            defaultValue={query}
            onChange={(e) => {
              debounce(() => {
                setQuery(e.target.value);
              })();
            }}
          />
        </Box>
      </Form>
      {results.map((bottle) => {
        const title = (
          <>
            {bottle.name}
            {bottle.series && <em>{bottle.series}</em>}
          </>
        );
        return (
          <Card key={bottle.id}>
            <CardActionArea href={`/b/${bottle.id}/checkin`}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                    L
                  </Avatar>
                }
                title={title}
                subheader={bottle.brand.name}
              />
            </CardActionArea>
          </Card>
        );
      })}
      {query && !results.length && (
        <Card>
          <CardActionArea href={`/addBottle?name=${encodeURIComponent(query)}`}>
            <CardHeader
              avatar={<AddIcon />}
              title="Can't find a bottle?"
              subheader={
                <span>
                  {`Tap here to add `}
                  <strong>{query}</strong>
                </span>
              }
            />
          </CardActionArea>
        </Card>
      )}
    </Box>
  );
}