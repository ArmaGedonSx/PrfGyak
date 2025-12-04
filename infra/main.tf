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
  # Ezt a Render URL-ből vagy profilból tudod kinézni, 
  # de ha üresen hagyod vagy warningot dob, 
  # a provider megpróbálja kitalálni.
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
  
  runtime_source = {
    type = "docker"
    repo = "https://github.com/ArmaGedonSx/PrfGyak.git"
    branch = "main"
    auto_deploy = "no"
  }

  env_vars = {
    NODE_VERSION = "20"
    MONGO_URI = "placeholder_value_change_in_dashboard"
  }
}

output "service_url" {
  value = render_web_service.mean_app.url
}
