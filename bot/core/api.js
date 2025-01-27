const FormData = require("form-data");
const app = require("../config/app");
const logger = require("../utils/logger");
const sleep = require("../utils/sleep");
var _ = require("lodash");

class ApiRequest {
  constructor(session_name) {
    this.session_name = session_name;
  }

  async get_user_data(http_client) {
    try {
      const response = await http_client.get(
        `${app.gameApiUrl}/api/v1/user/balance`
      );
      return response.data;
    } catch (error) {
      const regex = /ENOTFOUND\s([^\s]+)/;
      const match = error.message.match(regex);
      logger.error(
        `${this.session_name} | Error while getting User Data: ${
          error.message.includes("ENOTFOUND") ||
          error.message.includes("getaddrinfo") ||
          error.message.includes("ECONNREFUSED")
            ? `The proxy server at ${
                match && match[1] ? match[1] : "unknown address"
              } could not be found. Please check the proxy address and your network connection`
            : error.message
        }`
      );
      await sleep(3); // Sleep for 3 seconds
    }
  }

  async daily_reward(http_client) {
    try {
      const response = await http_client.post(
        `${app.gameApiUrl}/api/v1/daily-reward?offset=20`
      );
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while claiming daily: ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while claiming daily: ${error.message}`
        );
      }

      return false;
    }
  }

  async get_friend_balance(http_client) {
    try {
      const response = await http_client.get(
        `${app.gatewayApiUrl}/v1/friends/balance`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>getting friends balance:</b>: ${error?.response?.data?.message}`
        );
        logger.error(
          `${this.session_name} | Error while <b>getting friends balance:</b>: ${error.message}`
        );
      }
    }
  }

  async claim_friends_balance(http_client) {
    try {
      const response = await http_client.post(
        `${app.gatewayApiUrl}/v1/friends/claim`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>claiming friends balance:</b> ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>claiming friends balance:</b> ${error.message}`
        );
      }
    }
  }

  async get_time(http_client) {
    try {
      const response = await http_client.get(
        `${app.gameApiUrl}/api/v1/time/now`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>getting time:</b> ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>getting time:</b> ${error.message}`
        );
      }
    }
  }

  async start_game(http_client) {
    try {
      const response = await http_client.post(
        `${app.gameApiUrl}/api/v1/game/play`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>starting game:</b> ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>starting game:</b> ${error.message}`
        );
      }
    }
  }

  async claim_game_reward(http_client, data) {
    try {
      const response = await http_client.post(
        `${app.gameApiUrl}/api/v1/game/claim`,
        JSON.stringify(data)
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>claiming game reward:</b> ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>claiming game reward:</b> ${error.message}`
        );
      }
    }
  }

  async start_farming(http_client) {
    try {
      const response = await http_client.post(
        `${app.gameApiUrl}/api/v1/farming/start`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>starting farming:</b> ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>starting farming:</b> ${error.message}`
        );
      }
    }
  }

  async claim_farming(http_client) {
    try {
      const response = await http_client.post(
        `${app.gameApiUrl}/api/v1/farming/claim`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>claiming farm reward:</b> ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>claiming farm reward:</b> ${error.message}`
        );
      }
    }
  }

  async refresh_token(http_client, data) {
    try {
      const response = await http_client.post(
        `${app.gatewayApiUrl}/v1/auth/refresh`,
        JSON.stringify(data)
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>refreshing JWT token:</b> ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>refreshing JWT token:</b> ${error.message}`
        );
      }
    }
  }

  async check_jwt(http_client) {
    try {
      const response = await http_client.get(`${app.gatewayApiUrl}/v1/user/me`);
      return response.data?.username ? true : false;
    } catch (error) {
      if (error?.response?.data?.message && error?.response?.data?.code == 16) {
        logger.warning(
          `${this.session_name} | ⚠️ JWT token has expired: ${error?.response?.data?.message} | Trying to refresh...`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>checking JWT token:</b> ${error.message}`
        );
      }
      return false;
    }
  }

  async get_tribes(http_client) {
    try {
      const response = await http_client.get(
        `${app.gameApiUrl}/api/v1/tribe?search=Freddy_bots`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>getting tribes:</b> ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>getting tribes:</b> ${error.message}`
        );
      }
      return [];
    }
  }

  async join_tribe(http_client, tribe_id) {
    try {
      const response = await http_client.post(
        `${app.gameApiUrl}/api/v1/tribe/${tribe_id}/join`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>joining tribe:</b> ${error?.response?.data?.message}`
        );
      } else {
        logger.error(
          `${this.session_name} | Error while <b>joining tribe:</b> ${error.message}`
        );
      }
    }
  }

  async check_my_tribe(http_client) {
    try {
      const response = await http_client.get(
        `${app.gameApiUrl}/api/v1/tribe/my`
      );
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        logger.warning(
          `${this.session_name} | ⚠️ Error while <b>checking my tribe:</b> ${error?.response?.data?.message}`
        );
        return false;
      } else {
        logger.error(
          `${this.session_name} | Error while <b>checking my tribe:</b> ${error.message}`
        );
        return null;
      }
    }
  }
}

module.exports = ApiRequest;
