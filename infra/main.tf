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
  # Ha üresen hagyod a Jenkinsben, a provider megpróbálja kitalálni.
  # De ha hibát dob, meg kell adni a Render Team ID-t vagy User ID-t.
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

  # JAVÍTÁS 1: Itt kivettem az "=" jelet, mert ez egy blokk
  runtime_source {
    # JAVÍTÁS 2: Itt is kivettem az "=" jelet
    docker {
      # JAVÍTÁS 3: "repo" helyett "repo_url" kell
      repo_url = "https://github.com/ArmaGedonSx/PrfGyak.git"
      branch   = "main"
      
      # Javasolt: Ne deployoljon minden pushra, csak ha a Jenkins kéri
      auto_deploy = false 
    }
  }

  # Az env_vars viszont egy argumentum (map), itt KELL az "=" jel
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