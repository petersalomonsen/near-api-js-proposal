import { expect, test } from '@playwright/test';

test("say hello", () => {
    expect("hello").toBe("hello");
});

