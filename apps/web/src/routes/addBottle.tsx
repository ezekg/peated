import { useLocation, useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";

import api, { ApiError } from "../lib/api";
import { useRequiredAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { formatCategoryName, toTitleCase } from "../lib/strings";
import FormError from "../components/formError";
import FormHeader from "../components/formHeader";
import TextField from "../components/textField";
import Fieldset from "../components/fieldset";
import BrandField from "../components/brandField";
import DistillerField from "../components/distillerField";
import SelectField from "../components/selectField";
import { Option } from "../components/richSelectField";

type FormData = {
  name?: string;
  series?: string;
  brand?: Option | undefined;
  distillers?: Option[] | undefined;
  abv?: number;
  statedAge?: number;
  category?: string | undefined;
};

export default function AddBottle() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useRequiredAuth();

  const qs = new URLSearchParams(location.search);
  const name = toTitleCase(qs.get("name") || "");

  const [formData, setFormData] = useState<FormData>({
    name,
    series: "",
    category: "",
  });

  const categoryList = [
    "blend",
    "blended_grain",
    "blended_malt",
    "blended_scotch",
    "bourbon",
    "rye",
    "single_grain",
    "single_malt",
    "spirit",
  ].map((c) => ({
    id: c,
    name: formatCategoryName(c),
  }));

  const [error, setError] = useState<string | undefined>();

  const onSubmit = (e: FormEvent<HTMLFormElement | HTMLButtonElement>) => {
    e.preventDefault();

    (async () => {
      try {
        const bottle = await api.post("/bottles", { data: formData });
        navigate(`/bottles/${bottle.id}/checkin`, {
          replace: true,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          console.error(err);
          setError("Internal error");
        }
      }
    })();
  };

  return (
    <Layout
      header={<FormHeader title="Add Bottle" onSave={onSubmit} />}
      gutter
      noMobileGutter
    >
      <form className="sm:mx-16">
        {error && <FormError values={[error]} />}

        <Fieldset>
          <TextField
            type="text"
            label="Bottle"
            name="name"
            required
            helpText="The full name of the bottle, excluding its series."
            placeholder="e.g. Macallan 12"
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            value={formData.name}
          />
          <TextField
            type="text"
            label="Series"
            name="series"
            placeholder="e.g. The Edition"
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            value={formData.series}
          />

          <BrandField
            label="Brand"
            name="brand"
            helpText="The brand, or main label of the bottle."
            placeholder="e.g. Macallan"
            onChange={(value) =>
              setFormData({ ...formData, brand: value as Option })
            }
            required
            canCreate={user.admin}
            value={formData.brand}
          />

          <DistillerField
            label="Distiller"
            name="distillers"
            placeholder="e.g. Distiller"
            helpText="The distilleries which produces the spirit(s) for this bottle."
            onChange={(value) =>
              setFormData({
                ...formData,
                distillers: value as Option[],
              })
            }
            canCreate={user.admin}
            value={formData.distillers}
            multiple
          />

          <div className="flex">
            <div className="w-1/2 border-r">
              <TextField
                type="number"
                label="ABV"
                name="abv"
                placeholder="e.g. 45"
                helpText="The alcohol content by volume."
                required
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                value={formData.abv}
                suffixLabel="%"
              />
            </div>
            <div className="w-1/2">
              <TextField
                type="number"
                label="Stated Age"
                name="statedAge"
                placeholder="e.g. 12"
                helpText="The number of years the spirit was aged."
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
                value={formData.statedAge}
                suffixLabel="years"
              />
            </div>
          </div>

          <SelectField
            label="Category"
            name="category"
            placeholder="e.g. Single Malt"
            helpText="The kind of spirit."
            onChange={(value) =>
              setFormData({ ...formData, category: value as string })
            }
            value={formData.category}
            options={[
              { id: "", value: <em>Unknown</em> },
              ...categoryList.map(({ id, name }) => ({ id, value: name })),
            ]}
          />
        </Fieldset>
      </form>
    </Layout>
  );
}