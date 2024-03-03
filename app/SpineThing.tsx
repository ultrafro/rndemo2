import * as React from "react";
import { THREE } from "expo-three";
// import * as spine from "@esotericsoftware/spine-threejs";
import spine from "./minispine";
import { LoadTextWithCallback, LoadTextureWithCallback } from "./LoadingUtils";

interface SpineAnimationProps {
  name: string;
  path: string;
  scale?: number;
  onLoad: () => void;
  onError: () => void;
}

export type SpineAtlas = any;
export type SpineSkeleton = any;
export type SpineAnimationStateData = any;
export type SpineAnimationState = any;

export class SpineThing extends THREE.Object3D {
  static SKELETON_DATA_LOADED = "skeleton_data_loaded";

  public atlas: SpineAtlas | null = null;
  public skeleton: SpineSkeleton | null = null;
  public stateData: SpineAnimationStateData | null = null;
  public state: SpineAnimationState | null = null;

  private onLoad: () => void;
  private onError: () => void;
  private matrix: THREE.Matrix4 = new THREE.Matrix4();

  constructor(props: SpineAnimationProps) {
    super();
    this.onLoad = props.onLoad;
    this.onError = props.onError;
    this.loadSpineAnimation(props.name, props.path, props.scale);
  }

  private loadSpineAnimation(name: string, path: string, scale?: number) {
    path = path ? path + (path.substr(-1) !== "/" ? "/" : "") : "";

    const self = this;

    LoadTextWithCallback(path + name + ".atlas", function (atlasText) {
      self.atlas = new (spine as any).Atlas(atlasText, {
        load: function (page: THREE.Texture, image: string, atlas: SpineAtlas) {
          // loadImage(path + image, function (image) {
          LoadTextureWithCallback(path + image, function (tex, width, height) {
            // calculate UVs in atlas regions
            page.width = width;
            page.height = height;

            atlas.updateUVs(page);

            // propagate new UVs to attachments, if they were already created
            if (self.skeleton) {
              const skins = self.skeleton.data.skins;
              for (let s = 0, n = skins.length; s < n; s++) {
                const attachments = skins[s].attachments;
                for (const k in attachments) {
                  const attachment = attachments[k];
                  if (attachment instanceof (spine as any).RegionAttachment) {
                    const region = attachment.rendererObject;
                    attachment.setUVs(
                      region.u,
                      region.v,
                      region.u2,
                      region.v2,
                      region.rotate
                    );
                  }
                }
              }
            }

            // create basic material for the page
            //const texture = new THREE.Texture(image);
            const texture = tex;
            texture.needsUpdate = true;

            page.rendererObject = [
              new THREE.MeshBasicMaterial({
                //color: 0xff00, wireframe: true,
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                alphaTest: 0.5,
              }),
            ];
          });
        },
        unload: function (materials: THREE.Material[]) {
          for (let i = 0, n = materials.length; i < n; i++) {
            const material = materials[i];
            if (material.meshes) {
              for (const name in material.meshes) {
                const mesh = material.meshes[name];
                if (mesh.parent) mesh.parent.remove(mesh);
                mesh.geometry.dispose();
              }
            }
            material.map.dispose();
            material.dispose();
          }
          // will be called multiple times
          materials.length = 0;
        },
      });

      LoadTextWithCallback(path + name + ".json", function (skeletonText) {
        const json = new (spine as any).SkeletonJson(
          new (spine as any).AtlasAttachmentLoader(self.atlas!)
        );
        json.scale = scale || 1;

        const skeletonData = json.readSkeletonData(JSON.parse(skeletonText));

        self.skeleton = new (spine as any).Skeleton(skeletonData);
        self.stateData = new (spine as any).AnimationStateData(skeletonData);
        self.state = new (spine as any).AnimationState(self.stateData);

        self.onLoad();

        // self.dispatchEvent({
        //   type: SpineAnimation.SKELETON_DATA_LOADED,
        // });
      });
    });
  }

  public update = (dt: number, dz?: number) => {
    if (!this.state) return;

    this.state.update(dt || 1.0 / 60);
    this.state.apply(this.skeleton);
    this.skeleton.updateWorldTransform();

    (this as THREE.Object3D).traverse(function (object: any) {
      if (object instanceof THREE.Mesh) {
        object.visible = false;
      }
    });

    var Z = 0;
    var drawOrder = this.skeleton.drawOrder;
    for (var i = 0, n = drawOrder.length; i < n; i++) {
      var slot = drawOrder[i];
      var attachment = slot.attachment;
      if (!(attachment instanceof (spine as any).RegionAttachment)) continue;

      var materials = attachment.rendererObject.page.rendererObject;
      // texture was not loaded yet
      if (!materials) continue;

      if (slot.data.additiveBlending && materials.length == 1) {
        // create separate material for additive blending
        materials.push(
          new THREE.MeshBasicMaterial({
            map: materials[0].map,
            side: THREE.DoubleSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
      }

      var material = materials[slot.data.additiveBlending ? 1 : 0];

      material.meshes = material.meshes || {};

      var mesh = material.meshes[slot.data.name];

      var geometry;

      if (mesh) {
        geometry = mesh.geometry;

        mesh.visible = true;
      } else {
        geometry = new THREE.PlaneGeometry(
          attachment.regionOriginalWidth,
          attachment.regionOriginalHeight
        );
        geometry.dynamic = true;

        mesh = new THREE.Mesh(geometry, material);
        mesh.matrixAutoUpdate = false;

        material.meshes[slot.data.name] = mesh;
        (this as THREE.Object3D).add(mesh);
      }

      if (
        mesh.attachmentTime &&
        slot.getAttachmentTime() > mesh.attachmentTime
      ) {
        // do nothing
      } else {
        // // update UVs
        // geometry.faceVertexUvs[0][0][0].set(     //first triangle, first point x,y
        //   attachment.uvs[6],
        //   1 - attachment.uvs[7]
        // );
        // geometry.faceVertexUvs[0][0][1].set(     // first triangle, second point x,y
        //   attachment.uvs[4],
        //   1 - attachment.uvs[5]
        // );
        // geometry.faceVertexUvs[0][0][2].set(     // first triangle, third point x,y
        //   attachment.uvs[0],
        //   1 - attachment.uvs[1]
        // );
        // geometry.faceVertexUvs[0][1][0].set(     //second triangle, first point x,y
        //   attachment.uvs[4],
        //   1 - attachment.uvs[5]
        // );
        // geometry.faceVertexUvs[0][1][1].set(    // second triangle, second point x,y
        //   attachment.uvs[2],
        //   1 - attachment.uvs[3]
        // );
        // geometry.faceVertexUvs[0][1][2].set(    // second triangle, third point x,y
        //   attachment.uvs[0],
        //   1 - attachment.uvs[1]
        // );
        // geometry.uvsNeedUpdate = true;

        // geometry.vertices[1].set(attachment.offset[0], attachment.offset[1], 0);  //
        // geometry.vertices[3].set(attachment.offset[2], attachment.offset[3], 0);
        // geometry.vertices[2].set(attachment.offset[4], attachment.offset[5], 0);
        // geometry.vertices[0].set(attachment.offset[6], attachment.offset[7], 0);
        // geometry.verticesNeedUpdate = true;

        //create the appropriate float array
        var uvs = new Float32Array([
          attachment.uvs[6],
          1 - attachment.uvs[7],
          attachment.uvs[0],
          1 - attachment.uvs[1],
          attachment.uvs[4],
          1 - attachment.uvs[5],
          attachment.uvs[2],
          1 - attachment.uvs[3],
        ]);

        var uvs2 = new Float32Array([
          attachment.uvs[6],
          attachment.uvs[7],
          attachment.uvs[0],
          attachment.uvs[1],
          attachment.uvs[4],
          attachment.uvs[5],
          attachment.uvs[2],
          attachment.uvs[3],
        ]);

        var uvs3 = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);

        // Update UVs
        geometry.attributes.uv.set(uvs2);
        // geometry.attributes.uv.set();

        //rear upper arm:
        // [
        //     [
        //         {
        //             "x": 0.517578125,
        //             "y": 0.7734375
        //         },
        //         {
        //             "x": 0.517578125,
        //             "y": 0.9765625
        //         },
        //         {
        //             "x": 0.490234375,
        //             "y": 0.7734375
        //         }
        //     ],
        //     [
        //         {
        //             "x": 0.517578125,
        //             "y": 0.9765625
        //         },
        //         {
        //             "x": 0.490234375,
        //             "y": 0.9765625
        //         },
        //         {
        //             "x": 0.490234375,
        //             "y": 0.7734375
        //         }
        //     ]
        // ]

        //vertices
        // [
        //     {
        //         "x": 25.95833396911621,
        //         "y": 10.824835777282715,
        //         "z": 0
        //     },
        //     {
        //         "x": 25.73521614074707,
        //         "y": -7.973840713500977,
        //         "z": 0
        //     },
        //     {
        //         "x": -8.839215278625488,
        //         "y": 11.23784065246582,
        //         "z": 0
        //     },
        //     {
        //         "x": -9.062333106994629,
        //         "y": -7.560835361480713,
        //         "z": 0
        //     }
        // ]

        var positions = new Float32Array([
          attachment.offset[6],
          attachment.offset[7],
          0,
          attachment.offset[0],
          attachment.offset[1],
          0,
          attachment.offset[4],
          attachment.offset[5],
          0,
          attachment.offset[2],
          attachment.offset[3],
          0, // repeating vertex
        ]);

        // //try left/right flip
        // var positions = new Float32Array([
        //   attachment.offset[4],
        //   attachment.offset[5],
        //   0,
        //   attachment.offset[2],
        //   attachment.offset[3],
        //   0, // repeating vertex
        //   attachment.offset[6],
        //   attachment.offset[7],
        //   0,
        //   attachment.offset[0],
        //   attachment.offset[1],
        //   0,
        // ]);

        // //try left/right and up/down flip
        // var positions = new Float32Array([
        //   attachment.offset[2],
        //   attachment.offset[3],
        //   0, // repeating vertex
        //   attachment.offset[4],
        //   attachment.offset[5],
        //   0,
        //   attachment.offset[0],
        //   attachment.offset[1],
        //   0,

        //   attachment.offset[6],
        //   attachment.offset[7],
        //   0,
        // ]);

        // Update vertices
        geometry.attributes.position.set(positions);

        geometry.computeVertexNormals(); // Ensure normals are computed correctly
        geometry.uvsNeedUpdate = true;
        geometry.verticesNeedUpdate = true;

        mesh.attachmentTime = slot.getAttachmentTime();
      }

      this.matrix.makeTranslation(
        this.skeleton.x + slot.bone.worldX,
        this.skeleton.y + slot.bone.worldY,
        (dz || 0.1) * Z++
      );

      this.matrix.elements[0] = slot.bone.a;
      this.matrix.elements[4] = slot.bone.b;
      this.matrix.elements[1] = slot.bone.c;
      this.matrix.elements[5] = slot.bone.d;

      mesh.matrix.copy(this.matrix);

      /* TODO slot.r,g,b,a ?? turbulenz example code:
        batch.add(
            attachment.rendererObject.page.rendererObject,
            vertices[0], vertices[1],
            vertices[6], vertices[7],
            vertices[2], vertices[3],
            vertices[4], vertices[5],
            skeleton.r * slot.r,
            skeleton.g * slot.g,
            skeleton.b * slot.b,
            skeleton.a * slot.a,
            attachment.uvs[0], attachment.uvs[1],
            attachment.uvs[4], attachment.uvs[5]
        );
        */
    }
  };

  render() {
    return null; // This component doesn't render anything directly
  }
}

export default SpineThing;
