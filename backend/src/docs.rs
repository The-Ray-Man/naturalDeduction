use utoipa::OpenApi;
use utoipauto::utoipauto;

#[utoipauto(paths = "src/api")]
#[derive(OpenApi)]
#[openapi(
    tags(
        (name = "naturalDeduction", description = "FMFP goes easy"),
    ),
)]
pub struct ApiDocs;
