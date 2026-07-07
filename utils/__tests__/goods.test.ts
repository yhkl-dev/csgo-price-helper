import { describe, expect, it } from "vitest"

import {
  convertCookiesToString,
  decodeJWT,
  getUUYPAuthHeaders,
  searchForExactNameId
} from "../goods"
import type { UUYPDeviceInfo } from "../goods"

// ---- searchForExactNameId ----

describe("searchForExactNameId", () => {
  it("returns null for empty string", () => {
    expect(searchForExactNameId("")).toBeNull()
  })

  it("returns null for non-existent item name", () => {
    expect(
      searchForExactNameId("Definitely Not A Real CSGO Item Name XYZ")
    ).toBeNull()
  })

  it("returns name_id for known item (case-sensitive match)", () => {
    const result = searchForExactNameId(
      "AK-47 | Aquamarine Revenge (Factory New)"
    )
    expect(result).toBeTruthy()
    expect(typeof result).toBe("number")
  })
})

// ---- decodeJWT ----

describe("decodeJWT", () => {
  it("decodes a valid 3-part JWT and returns parsed payload", () => {
    const payload = { Id: "12345", exp: 9999999999 }
    const encodedPayload = btoa(JSON.stringify(payload))
    const token = `header.${encodedPayload}.signature`
    expect(decodeJWT(token)).toEqual(payload)
  })

  it("returns null for token with fewer than 3 parts", () => {
    expect(decodeJWT("header.payload")).toBeNull()
  })

  it("returns null for token with more than 3 parts", () => {
    expect(decodeJWT("header.payload.sig.extra")).toBeNull()
  })

  it("returns null for non-JSON payload", () => {
    const encoded = btoa("not-json")
    expect(decodeJWT(`header.${encoded}.sig`)).toBeNull()
  })

  it("returns null for malformed base64 payload", () => {
    expect(decodeJWT("header.!!!not-valid-base64!!!.sig")).toBeNull()
  })
})

// ---- getUUYPAuthHeaders ----

describe("getUUYPAuthHeaders", () => {
  it("returns common headers with authorization bearer token", () => {
    const headers = getUUYPAuthHeaders("test-token")
    expect(headers.authorization).toBe("Bearer test-token")
    expect(headers["content-type"]).toBe("application/json")
    expect(headers.platform).toBe("pc")
  })

  it("includes deviceId when device has deviceId", () => {
    const device: UUYPDeviceInfo = { deviceId: "dev-123", deviceUk: "", uk: "" }
    const headers = getUUYPAuthHeaders("token", device)
    expect(headers.deviceId).toBe("dev-123")
  })

  it("includes deviceUk when device has deviceUk", () => {
    const device: UUYPDeviceInfo = { deviceId: "", deviceUk: "uk-456", uk: "" }
    const headers = getUUYPAuthHeaders("token", device)
    expect(headers.deviceUk).toBe("uk-456")
  })

  it("includes uk when device has uk", () => {
    const device: UUYPDeviceInfo = {
      deviceId: "",
      deviceUk: "",
      uk: "web-uk-789"
    }
    const headers = getUUYPAuthHeaders("token", device)
    expect(headers.uk).toBe("web-uk-789")
  })

  it("does not include device fields when device is undefined", () => {
    const headers = getUUYPAuthHeaders("token")
    expect(headers).not.toHaveProperty("deviceId")
    expect(headers).not.toHaveProperty("deviceUk")
    expect(headers).not.toHaveProperty("uk")
  })

  it("does not include device fields when device fields are empty strings", () => {
    const device: UUYPDeviceInfo = { deviceId: "", deviceUk: "", uk: "" }
    const headers = getUUYPAuthHeaders("token", device)
    expect(headers).not.toHaveProperty("deviceId")
    expect(headers).not.toHaveProperty("deviceUk")
    expect(headers).not.toHaveProperty("uk")
  })
})

// ---- convertCookiesToString ----

describe("convertCookiesToString", () => {
  it("converts cookie array to semicolon-separated string", () => {
    const cookies = [
      { name: "session", value: "abc123" },
      { name: "token", value: "xyz789" }
    ] as chrome.cookies.Cookie[]
    expect(convertCookiesToString(cookies)).toBe("session=abc123; token=xyz789")
  })

  it("returns empty string for empty array", () => {
    expect(convertCookiesToString([])).toBe("")
  })

  it("handles single cookie", () => {
    const cookies = [{ name: "auth", value: "val" }] as chrome.cookies.Cookie[]
    expect(convertCookiesToString(cookies)).toBe("auth=val")
  })
})
