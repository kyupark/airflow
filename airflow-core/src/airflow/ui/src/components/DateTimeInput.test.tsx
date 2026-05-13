/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { TimezoneContext } from "src/context/timezone";
import { Wrapper } from "src/utils/Wrapper";

import { DateTimeInput } from "./DateTimeInput";

const pasteText = (text: string) => {
  fireEvent.paste(screen.getByTestId("datetime-input"), {
    clipboardData: {
      getData: vi.fn().mockReturnValue(text),
    },
  });
};

describe("DateTimeInput paste", () => {
  it("Pastes a valid datetime and fires onChange with UTC value", () => {
    const onChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>();

    render(
      <TimezoneContext.Provider value={{ selectedTimezone: "UTC", setSelectedTimezone: vi.fn() }}>
        <DateTimeInput onChange={onChange} value="" />
      </TimezoneContext.Provider>,
      { wrapper: Wrapper },
    );

    pasteText("2026-05-13 10:00:00");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0].target.value).toBe("2026-05-13T10:00:00.000Z");
  });

  it("Interprets timezone-less pasted values in the selected timezone", () => {
    const onChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>();

    render(
      <TimezoneContext.Provider
        value={{ selectedTimezone: "America/New_York", setSelectedTimezone: vi.fn() }}
      >
        <DateTimeInput onChange={onChange} value="" />
      </TimezoneContext.Provider>,
      { wrapper: Wrapper },
    );

    pasteText("2026-05-13 10:00:00");

    expect(onChange).toHaveBeenCalledTimes(1);
    // 10:00 in New York (EDT, UTC-4) → 14:00 UTC
    expect(onChange.mock.calls[0]?.[0].target.value).toBe("2026-05-13T14:00:00.000Z");
  });

  it("Does not fire onChange for an invalid pasted string", () => {
    const onChange = vi.fn();

    render(
      <TimezoneContext.Provider value={{ selectedTimezone: "UTC", setSelectedTimezone: vi.fn() }}>
        <DateTimeInput onChange={onChange} value="" />
      </TimezoneContext.Provider>,
      { wrapper: Wrapper },
    );

    pasteText("not a date");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("Does not fire onChange for an empty pasted string", () => {
    const onChange = vi.fn();

    render(
      <TimezoneContext.Provider value={{ selectedTimezone: "UTC", setSelectedTimezone: vi.fn() }}>
        <DateTimeInput onChange={onChange} value="" />
      </TimezoneContext.Provider>,
      { wrapper: Wrapper },
    );

    pasteText("");

    expect(onChange).not.toHaveBeenCalled();
  });
});
