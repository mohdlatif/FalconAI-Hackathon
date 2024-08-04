// background.test.js

// Mock chrome.storage.local.get and chrome.storage.local.set for testing
jest.mock("chrome.storage.local", () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

// Import the function to be tested
const { getUserId } = require("./background");

// Mock the randomId function
const randomId = jest.fn(() => "mockUserId");

// Replace the original randomId function with the mock
getUserId.mockImplementation(() => randomId());

test("Should return a new user ID when the user ID is not present in chrome storage", async () => {
  // Mock the chrome.storage.local.get function to return an empty object
  chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
    callback({ userId: null });
  });

  // Mock the chrome.storage.local.set function to return a promise that resolves
  chrome.storage.local.set.mockResolvedValueOnce();

  // Call the getUserId function
  const userId = await getUserId();

  // Assert that the randomId function was called
  expect(randomId).toHaveBeenCalled();

  // Assert that the chrome.storage.local.set function was called with the new user ID
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    userId: "mockUserId",
  });

  // Assert that the returned user ID is the same as the new user ID
  expect(userId).toBe("mockUserId");
});
