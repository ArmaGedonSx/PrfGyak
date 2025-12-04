terraform {
  required_providers {
    render = {
      source = "render-oss/render"
      version = "1.2.0"
    }
  }
}

variable "render_api_key" {
  type = string
  sensitive = true
}

variable "owner_id" {
  type = string
  # Ha hibát dob a pipeline, itt majd meg kell adnod a Render User ID-t.
}

provider "render" {
  api_key = var.render_api_key
  owner_id = var.owner_id
}

# Web Service létrehozása
resource "render_web_service" "mean_app" {
  name = "recept-gyujtemeny"
  plan = "free"
  region = "frankfurt"

  # JAVÍTÁS: Visszatettem az "=" jeleket, mert a hibaüzenet kérte,
  # DE kijavítottam a "repo"-t "repo_url"-re.
  runtime_source = {
    docker = {
      repo_url    = "https://github.com/ArmaGedonSx/PrfGyak.git"
      branch      = "main"
      auto_deploy = false
    }
  }

  env_vars = {
    "NODE_VERSION" = {
      value = "20"
    }
    "MONGO_URI" = {
      value = "placeholder_value_change_in_dashboard"
    }
  }
}

output "service_url" {
  value = render_web_service.mean_app.url
}